"""Application configuration."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application settings loaded from environment variables.
    """

    # Google Maps Platform key.
    # Later this key will be used for:
    # - Air Quality API
    # - Weather API
    # - Optional Maps/Geocoding APIs
    google_maps_api_key: str | None = None

    # Cache live Google data for 15 minutes.
    # This keeps API usage low and helps stay inside free-tier limits.
    live_data_cache_seconds: int = 900

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Return cached application settings.
    """
    return Settings()