#!/usr/bin/env python3
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = int(os.environ.get("SERVICE_PORT", "8081"))
UPLOAD_DIR = Path(os.environ["UPLOAD_DIR"])


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/health"):
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok\n")
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path != "/upload":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = self.rfile.read(length)
        target = UPLOAD_DIR / f"upload-{int(time.time() * 1000)}.bin"
        try:
            target.write_bytes(payload)
        except PermissionError:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b"permission denied\n")
            return
        self.send_response(201)
        self.end_headers()
        self.wfile.write(b"stored\n")

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    server.serve_forever()
