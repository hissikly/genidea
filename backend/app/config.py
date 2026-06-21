from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"), env_file_ignore_empty=True, extra="ignore"
    )

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "nvidia/nemotron-3-super-120b-a12b:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # YC Algolia (public, search-only keys used by ycombinator.com)
    search_app_id: str = "45BWZJ1SGC"
    search_api_key: str = "MjBjYjRiMzY0NzdhZWY0NjI4OTVmMmYxNzg3ODNkMjI4ZWMyMmJmYWY0ZGIyNTBlNmQ1NGY0ZWVjOWJjNTUyNHZhbGlkVW50aWw9MTc1OTM0NDcyNQ=="
    yc_index: str = "YCCompany_production"

    # Auth
    jwt_secret: str = "CHANGE_ME_IN_ENV_dev_secret_key"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # App
    database_url: str = "sqlite:///./yc_ideas.db"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
