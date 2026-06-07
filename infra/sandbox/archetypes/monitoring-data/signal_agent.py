#!/usr/bin/env python3
import os
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


CONFIG_FILE = Path(os.environ.get("CONFIG_FILE", "/etc/signal-agent/config.env"))
DEFAULT_ENDPOINT = "http://127.0.0.1:9091/ingest"


def endpoint_from_config() -> str | None:
    try:
        for line in CONFIG_FILE.read_text().splitlines():
            if line.startswith("METRICS_ENDPOINT="):
                return line.split("=", 1)[1].strip()
    except FileNotFoundError:
        return None
    return None


def current_endpoint() -> str:
    # systemd Environment= wins over the config file; this precedence is the point of the scenario.
    return (
        os.environ.get("METRICS_ENDPOINT") or endpoint_from_config() or DEFAULT_ENDPOINT
    )


def post_heartbeat(endpoint: str):
    request = Request(endpoint, data=b"heartbeat", method="POST")
    try:
        with urlopen(request, timeout=2):
            return
    except (OSError, URLError):
        return


if __name__ == "__main__":
    while True:
        post_heartbeat(current_endpoint())
        time.sleep(2)
