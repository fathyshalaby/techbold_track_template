#!/usr/bin/env python3
import json
import os
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


HOST = os.environ["PARTNER_HOST"]
PORT = int(os.environ.get("PARTNER_PORT", "9000"))
STATUS_PATH = Path(os.environ["STATUS_PATH"])


def probe() -> bool:
    try:
        with urlopen(f"http://{HOST}:{PORT}/ping", timeout=2) as response:
            return response.status == 200 and response.read().strip() == b"pong"
    except (OSError, URLError):
        return False


def write_status(reachable: bool):
    STATUS_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATUS_PATH.write_text(
        json.dumps(
            {
                "partner_reachable": reachable,
                "checked_at": int(time.time()),
                "target": f"{HOST}:{PORT}",
            }
        )
        + "\n"
    )


if __name__ == "__main__":
    while True:
        write_status(probe())
        time.sleep(5)
