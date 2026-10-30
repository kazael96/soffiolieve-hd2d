"""Local QA overlay; the verified build remains read-only and contains no test UI."""
import argparse
import json
import base64
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('site', type=Path)
parser.add_argument('qa', type=Path)
parser.add_argument('--port', type=int, default=4182)
args = parser.parse_args()

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        # A local-only artifact sink keeps long GPU runs reviewable even if the
        # browser automation connection is interrupted. Never part of Pages.
        kind = urlsplit(self.path).path
        if kind not in ('/__qa/report', '/__qa/snapshot'):
            self.send_error(404)
            return
        origin = self.headers.get('Origin', '')
        if origin not in (f'http://127.0.0.1:{args.port}', f'http://localhost:{args.port}'):
            self.send_error(403)
            return
        try:
            size = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            self.send_error(400)
            return
        if not 0 < size <= 4_000_000:
            self.send_error(413)
            return
        try:
            data = json.loads(self.rfile.read(size))
            width, height = data['viewport']
            if not all(isinstance(n, int) and 100 <= n <= 8000 for n in (width, height)):
                raise ValueError('Invalid viewport')
            if kind == '/__qa/report':
                destination = args.qa.resolve() / f'report-{width}x{height}.json'
                temporary = destination.with_suffix('.pending')
                temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
                temporary.replace(destination)
            else:
                name = re.sub(r'[^a-zA-Z0-9-]', '-', str(data['label']))[:100]
                image = base64.b64decode(data['png'].removeprefix('data:image/png;base64,'), validate=True)
                if not image.startswith(b'\x89PNG\r\n\x1a\n'):
                    raise ValueError('Invalid PNG')
                (args.qa.resolve() / f'{width}x{height}-{name}.png').write_bytes(image)
        except (ValueError, KeyError, TypeError):
            self.send_error(400)
            return
        self.send_response(204)
        self.end_headers()

    def translate_path(self, value):
        pathname = urlsplit(value).path
        if pathname == '/qa-browser.html':
            return str(args.qa.resolve() / 'index.html')
        if pathname.startswith('/__qa/'):
            name = pathname.removeprefix('/__qa/')
            if name not in ('index.html', 'browser-qa.js'):
                return str(args.qa.resolve() / '__not_found__')
            return str(args.qa.resolve() / name)
        return super().translate_path(value)
    def log_message(self, *unused):
        pass

print(f'QA http://127.0.0.1:{args.port}/qa-browser.html', flush=True)
ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(args.site.resolve()))).serve_forever()
