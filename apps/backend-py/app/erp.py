"""Phoenix ERP client — auth, tickets, customer-system, activities. (rubric E: separate module)

Wraps the Phoenix REST API (docs/phoenix-openapi.yaml), injecting the bearer token and
adding timeouts + a small retry on transient/5xx errors. Raises ERPError with a status code
so the API layer can map it to a clean HTTP response.
"""
from __future__ import annotations

import time
from typing import Any

import httpx

from .case_source import active_phoenix_base_url
from .config import settings


class ERPError(Exception):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


class PhoenixClient:
    def __init__(self) -> None:
        token = settings.phoenix_api_token or "sandbox-local-token"
        self._token = token
        self._clients: dict[str, httpx.Client] = {}

    def _client(self) -> httpx.Client:
        base_url = active_phoenix_base_url().rstrip("/")
        if base_url not in self._clients:
            self._clients[base_url] = httpx.Client(
                base_url=base_url,
                timeout=15.0,
                headers={
                    "Authorization": f"Bearer {self._token}",
                    "Accept": "application/json",
                },
            )
        return self._clients[base_url]

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                resp = self._client().request(method, path, **kwargs)
            except httpx.HTTPError as exc:  # network/timeout
                last_err = exc
                time.sleep(0.4 * (attempt + 1))
                continue
            if resp.status_code >= 500:
                last_err = ERPError(f"{resp.status_code} from Phoenix {path}", resp.status_code)
                time.sleep(0.4 * (attempt + 1))
                continue
            if resp.status_code == 401:
                raise ERPError("Phoenix auth failed — check PHOENIX_API_TOKEN", 401)
            if resp.status_code == 404:
                raise ERPError(f"Phoenix resource not found: {path}", 404)
            if resp.status_code >= 400:
                raise ERPError(f"{resp.status_code} from Phoenix {path}: {resp.text[:300]}", resp.status_code)
            return resp
        status = getattr(last_err, "status", None) or 502
        raise ERPError(f"Phoenix unreachable for {path}: {last_err}", status)

    # ---- endpoints (mirror docs/phoenix-openapi.yaml) ----
    def me(self) -> dict:
        return self._request("GET", "/api/v1/me").json()

    def list_tickets(self, status: str | None = None, priority: str | None = None, sort: str = "date") -> list[dict]:
        params = {k: v for k, v in (("status", status), ("priority", priority), ("sort", sort)) if v}
        return self._request("GET", "/api/v1/me/tickets", params=params).json()

    def get_ticket(self, ticket_id: int) -> dict:
        return self._request("GET", f"/api/v1/tickets/{ticket_id}").json()

    def get_customer_system(self, ticket_id: int) -> dict:
        return self._request("GET", f"/api/v1/tickets/{ticket_id}/customer-system").json()

    def set_status(self, ticket_id: int, status: str) -> dict:
        return self._request("PATCH", f"/api/v1/tickets/{ticket_id}/status", json={"status": status}).json()

    def create_activity(self, payload: dict) -> dict:
        return self._request("POST", "/api/v1/activities/create", json=payload).json()

    def reset(self) -> dict:
        return self._request("POST", "/api/v1/me/reset").json()
