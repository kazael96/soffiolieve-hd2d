import functools
import http.client
import importlib.util
import json
from pathlib import Path
import threading
import types
import unittest

spec = importlib.util.spec_from_file_location('soffiolieve_qa_server', Path(__file__).resolve().parents[1] / 'scripts/serve-browser-qa.py')
qa_server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa_server)
builder_spec = importlib.util.spec_from_file_location('soffiolieve_qa_builder', Path(__file__).resolve().parents[1] / 'scripts/build-site.py')
builder = importlib.util.module_from_spec(builder_spec)
builder_spec.loader.exec_module(builder)


class QAServerTests(unittest.TestCase):
    def test_rejected_origins_receive_complete_403_without_reset_or_artifact_writes(self):
        with builder.build_staging() as folder:
            site, overlay = Path(folder) / 'site', Path(folder) / 'qa'
            site.mkdir()
            overlay.mkdir()
            qa_server.args = types.SimpleNamespace(qa=overlay, site=site, port=0)
            server = qa_server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(qa_server.Handler, directory=str(site)))
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            payload = b'x' * 65536
            try:
                for _ in range(20):
                    connection = http.client.HTTPConnection('127.0.0.1', server.server_port, timeout=10)
                    try:
                        connection.request('POST', '/__qa/report', body=payload, headers={'Origin': 'http://127.0.0.1:1'})
                        response = connection.getresponse()
                        self.assertEqual(response.status, 403)
                        self.assertIn(b'403', response.read())
                    finally:
                        connection.close()
                self.assertEqual(list(overlay.iterdir()), [])
            finally:
                server.shutdown()
                server.server_close()
                worker.join(timeout=5)

    def test_full_large_response_and_overlay_share_a_persistent_connection(self):
        with builder.build_staging() as folder:
            site = Path(folder) / 'site'
            overlay = Path(folder) / 'qa'
            site.mkdir()
            overlay.mkdir()
            payload = bytes(range(256)) * 8193 + b'COMPLETE TAIL'
            (site / 'app.js').write_bytes(payload)
            (overlay / 'index.html').write_bytes(b'<html>isolated QA</html>')
            qa_server.args = types.SimpleNamespace(qa=overlay, site=site, port=0)
            server = qa_server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(qa_server.Handler, directory=str(site)))
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            connection = http.client.HTTPConnection('127.0.0.1', server.server_port, timeout=10)
            try:
                connection.request('GET', '/app.js?v=one')
                response = connection.getresponse()
                self.assertEqual(response.version, 11)
                self.assertEqual(response.status, 200)
                self.assertEqual(int(response.getheader('Content-Length')), len(payload))
                self.assertEqual(response.read(), payload)
                original_socket = connection.sock
                self.assertIsNotNone(original_socket)
                connection.request('GET', '/qa-browser.html')
                response = connection.getresponse()
                self.assertEqual(response.read(), b'<html>isolated QA</html>')
                self.assertIs(connection.sock, original_socket)
                connection.request('GET', '/app.js?v=two')
                self.assertEqual(connection.getresponse().read(), payload)
                self.assertIs(connection.sock, original_socket)
                report = {'viewport': [390, 844], 'result': 'PASS'}
                encoded = json.dumps(report).encode()
                connection.request('POST', '/__qa/report', body=encoded, headers={'Origin': f'http://127.0.0.1:{server.server_port}', 'Content-Type': 'application/json'})
                response = connection.getresponse()
                self.assertEqual(response.status, 204)
                response.read()
                self.assertEqual(json.loads((overlay / 'report-390x844.json').read_text(encoding='utf-8')), report)
                self.assertEqual(list(site.glob('report*')), [])
                connection.request('POST', '/__qa/report', body=encoded, headers={'Origin': 'http://127.0.0.1:1', 'Content-Type': 'application/json'})
                response = connection.getresponse()
                self.assertEqual(response.status, 403)
                response.read()
            finally:
                connection.close()
                server.shutdown()
                server.server_close()
                worker.join(timeout=5)


if __name__ == '__main__':
    unittest.main()
