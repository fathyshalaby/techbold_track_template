"""Typed settings loaded from env / .env (pydantic-settings).

Secrets live in .env (git-ignored). This module never logs them. Env var names are the
upper-case of each field (e.g. AZURE_OPENAI_API_KEY -> azure_openai_api_key).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # repo-root .env (monorepo: apps/backend-py -> ../../.env), or container env (Docker)
        env_file=("../../.env", "../.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Phoenix ERP ----
    phoenix_api_base_url: str = ""
    phoenix_api_token: str = ""
    sandbox_case_count: int = 0
    sandbox_phoenix_api_base_url: str = "http://sandbox-phoenix:9000"

    # ---- SSH ----
    ssh_private_key_path: str = "/keys/case1_key.pem"
    ssh_key_dir: str = "/keys"
    ssh_username: str = "azureuser"
    ssh_connect_timeout: int = 10
    ssh_command_timeout: int = 30

    # ---- behaviour ----
    # Default FALSE: require explicit human approval for EVERY command — identical to
    # the node backend and to the rules ("a human confirms every action; the agent
    # never acts on its own"). Set true only for an explicitly unattended run.
    auto_run_readonly: bool = False

    # ---- LLM: azure (primary) | openrouter | local ----
    llm_provider: str = "azure"
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""
    azure_openai_api_version: str = "2025-01-01-preview"
    azure_openai_deployment: str = "gpt-5.4-nano"
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "anthropic/claude-sonnet-4-6"
    local_base_url: str = "http://host.docker.internal:1234/v1"
    local_api_key: str = "lm-studio"
    local_model: str = "qwen3-coder-30b-a3b-instruct"
    llm_model: str = "gpt-5.4-nano"

    # ---- Shared assets ----
    shared_dir: str = "/shared"


settings = Settings()
