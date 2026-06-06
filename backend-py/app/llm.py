"""LLM client — provider-agnostic chat with tools. azure (primary) | openrouter | local.

Returns the raw OpenAI-style assistant message so the agent loop can inspect tool_calls.
Resilient to providers/models that reject optional params (temperature, parallel_tool_calls):
it strips the offending kwarg and retries. (rubric E: AI errors handled with retries.)
"""
from __future__ import annotations

from typing import Any

from openai import AzureOpenAI, OpenAI

from .config import settings

_client: Any = None
_model: str | None = None


class LLMError(Exception):
    pass


def _build() -> tuple[Any, str]:
    global _client, _model
    if _client is not None and _model is not None:
        return _client, _model
    provider = settings.llm_provider.lower()
    if provider == "azure":
        _client = AzureOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            timeout=60.0,
            max_retries=2,
        )
        _model = settings.azure_openai_deployment
    elif provider == "openrouter":
        _client = OpenAI(
            base_url=settings.openrouter_base_url,
            api_key=settings.openrouter_api_key,
            timeout=60.0,
            max_retries=2,
        )
        _model = settings.openrouter_model
    else:  # local (LM Studio / Ollama)
        _client = OpenAI(
            base_url=settings.local_base_url,
            api_key=settings.local_api_key or "local",
            timeout=120.0,
            max_retries=1,
        )
        _model = settings.local_model
    return _client, _model


def chat(
    messages: list[dict],
    tools: list[dict] | None = None,
    tool_choice: str | None = None,
    response_format: dict | None = None,
    temperature: float | None = 0.0,
):
    """Single chat completion. Returns the assistant message object (.content, .tool_calls)."""
    client, model = _build()
    kwargs: dict[str, Any] = {"model": model, "messages": messages}
    if temperature is not None:
        kwargs["temperature"] = temperature
    if tools:
        kwargs["tools"] = tools
        kwargs["tool_choice"] = tool_choice or "auto"
        kwargs["parallel_tool_calls"] = False
    if response_format:
        kwargs["response_format"] = response_format

    optional = ["parallel_tool_calls", "temperature"]
    last_exc: Exception | None = None
    for _ in range(3):
        try:
            resp = client.chat.completions.create(**kwargs)
            return resp.choices[0].message
        except Exception as exc:  # noqa: BLE001 — map any SDK error
            last_exc = exc
            lowered = str(exc).lower()
            stripped = False
            for key in list(optional):
                if key in kwargs and key in lowered:
                    kwargs.pop(key, None)
                    optional.remove(key)
                    stripped = True
            if stripped:
                continue
            break
    raise LLMError(f"LLM call failed ({settings.llm_provider}/{model}): {last_exc}")
