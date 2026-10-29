"""Local server for the same readable page routes used on Vercel."""

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
ROUTES = {f"/{slug}": f"/{filename}" for filename, slug in json.loads((ROOT / "routes.json").read_text()).items()}


class SiteHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.serve_route()

    def do_HEAD(self):
        self.serve_route(head_only=True)

    def serve_route(self, head_only=False):
        path = urlsplit(self.path).path
        if path == "/" or (path.endswith("/") and path[:-1] in ROUTES):
            destination = "/pushkar-fair" if path == "/" else path[:-1]
            self.send_response(302)
            self.send_header("Location", destination)
            self.end_headers()
            return
        if path in ROUTES:
            self.path = ROUTES[path]
        if head_only:
            super().do_HEAD()
        else:
            super().do_GET()


if __name__ == "__main__":
    import sys

    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(SiteHandler, directory=str(ROOT)))
    print(f"Serving at http://localhost:{port}/pushkar-fair", flush=True)
    server.serve_forever()
