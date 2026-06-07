from __future__ import annotations

from . import llm
from .config import settings


def _is_configured(value: str | None) -> bool:
    if not value:
        return False
    lowered = value.strip().lower()
    return bool(lowered) and "replace-with" not in lowered and "<your-" not in lowered


def _openrouter_models() -> list[str]:
    raw = settings.openrouter_allowed_models or settings.openrouter_model
    return [item.strip() for item in raw.split(",") if item.strip()]


def _azure_models() -> list[str]:
    raw = settings.azure_openai_allowed_deployments or settings.azure_openai_deployment
    return [item.strip() for item in raw.split(",") if item.strip()]


def _option(provider: str, model: str, label: str, configured: bool) -> dict:
    active_model = active()["model"]
    is_active = settings.llm_provider.lower() == provider and active_model == model
    return {
        "id": f"{provider}:{model}",
        "provider": provider,
        "label": label,
        "model": model,
        "configured": configured,
        "active": is_active,
    }


def active() -> dict:
    provider = settings.llm_provider.lower()
    if provider == "openrouter":
        model = settings.openrouter_model
    elif provider == "local":
        model = settings.local_model
    else:
        provider = "azure"
        model = settings.azure_openai_deployment
    return {"provider": provider, "model": model, "id": f"{provider}:{model}"}


def list_models() -> dict:
    options: list[dict] = []
    azure_configured = (
        _is_configured(settings.azure_openai_endpoint)
        and _is_configured(settings.azure_openai_api_key)
        and _is_configured(settings.azure_openai_deployment)
    )
    if azure_configured:
        for model in _azure_models():
            options.append(_option("azure", model, f"Azure · {model}", True))

    if _is_configured(settings.openrouter_api_key):
        for model in _openrouter_models():
            options.append(_option("openrouter", model, f"OpenRouter · {model}", True))

    if _is_configured(settings.local_model):
        options.append(_option("local", settings.local_model, f"Local · {settings.local_model}", True))

    current = active()
    for item in options:
        item["active"] = item["provider"] == current["provider"] and item["model"] == current["model"]
    if options and not any(item["active"] for item in options):
        options[0]["active"] = True
        current = {"provider": options[0]["provider"], "model": options[0]["model"], "id": options[0]["id"]}

    return {"active": current, "models": options}


def select_model(provider: str, model: str) -> dict:
    provider = provider.lower()
    available = [item for item in list_models()["models"] if item["configured"]]
    selected = next((item for item in available if item["provider"] == provider and item["model"] == model), None)
    if selected is None:
        raise ValueError("model is not configured")

    settings.llm_provider = provider
    if provider == "azure":
        settings.azure_openai_deployment = model
        settings.llm_model = model
    elif provider == "openrouter":
        settings.openrouter_model = model
    elif provider == "local":
        settings.local_model = model

    llm.reset_client()
    return list_models()
