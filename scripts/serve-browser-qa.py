"""Local QA overlay; the verified build remains read-only and contains no test UI."""
import argparse
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
