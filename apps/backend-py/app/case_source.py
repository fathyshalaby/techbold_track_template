"""Runtime case-source selection for real Phoenix vs local Docker sandbox cases."""

from __future__ import annotations

from typing import Literal
from urllib.parse import urlparse

from .config import settings

CaseSourceSelection = Literal["real_erp", "sandbox_cases"]
ErpSource = Literal["real_erp", "local_or_mock", "sandbox_cases"]

_LOCAL_HOSTS = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "host.docker.internal",
    "phoenix-mock",
}
_selected: CaseSourceSelection = (
    "sandbox_cases" if settings.sandbox_case_count > 0 else "real_erp"
)


def sandbox_available() -> bool:
    return settings.sandbox_case_count > 0


def selected_case_source() -> CaseSourceSelection:
    return _selected


def set_case_source(source: str) -> CaseSourceSelection:
    global _selected
    if source not in ("real_erp", "sandbox_cases"):
        raise ValueError("case source must be real_erp or sandbox_cases")
    if source == "sandbox_cases" and not sandbox_available():
        raise ValueError(
            "sandbox cases are not seeded; set SANDBOX_CASE_COUNT > 0 and restart compose"
        )
    _selected = source  # type: ignore[assignment]
    return _selected


def active_phoenix_base_url() -> str:
    if _selected == "sandbox_cases":
        return settings.sandbox_phoenix_api_base_url
    return settings.phoenix_api_base_url


def erp_source() -> ErpSource:
    if _selected == "sandbox_cases":
        return "sandbox_cases"
    host = (urlparse(settings.phoenix_api_base_url).hostname or "").lower()
    return "local_or_mock" if host in _LOCAL_HOSTS else "real_erp"


def status() -> dict:
    return {
        "case_source": _selected,
        "erp_source": erp_source(),
        "sandbox_case_count": settings.sandbox_case_count,
        "sandbox_available": sandbox_available(),
    }
