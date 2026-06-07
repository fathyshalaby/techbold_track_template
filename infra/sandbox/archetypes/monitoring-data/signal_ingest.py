#!/usr/bin/env python3
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PORT = int(os.environ.get("SERVICE_PORT", "9091"))
COUNT_FILE = Path(os.environ["COUNT_FILE"])


def read_count() -> int:
    try:
        return int(COUNT_FILE.read_text().strip() or "0")
    except FileNotFoundError:
        return 0


def write_count(value: int):
    COUNT_FILE.parent.mkdir(parents=True, exist_ok=True)
    COUNT_FILE.write_text(f"{value}\n")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/metrics/count":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f"{read_count()}\n".encode())
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == "/ingest":
            write_count(read_count() + 1)
            self.send_response(202)
            self.end_headers()
            self.wfile.write(b"accepted\n")
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
