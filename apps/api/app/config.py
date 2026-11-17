from functools import lru_cache

from pydantic import AliasChoices, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_log_level: str = "INFO"
    app_cors_origins: str = Field(
        default="http://localhost:3000",
        validation_alias=AliasChoices("APP_CORS_ORIGINS", "CORS_ORIGINS"),
    )
    supabase_url: str = ""
    supabase_publishable_key: SecretStr = Field(
        default=SecretStr(""),
        validation_alias=AliasChoices(
            "SUPABASE_PUBLISHABLE_KEY",
            "SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        ),
    )
    supabase_secret_key: SecretStr = Field(
        default=SecretStr(""),
        validation_alias=AliasChoices("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"),
    )
    edge_api_token: SecretStr = SecretStr("")
    default_model_version: str = "pending"
    default_rule_set_version: str = "1"

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_secret_key.get_secret_value())

    @property
    def supabase_apikey(self) -> str:
        return (
            self.supabase_publishable_key.get_secret_value()
            or self.supabase_secret_key.get_secret_value()
        )

    @property
    def cors_origins(self) -> list[str]:
        return [value.strip() for value in self.app_cors_origins.split(",") if value.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
