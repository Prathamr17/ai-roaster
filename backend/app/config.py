import sys
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    node_env: str = "development"
    port: int = 5000

    mongo_uri: str = ""
    jwt_secret: str = ""
    jwt_expires_in_days: int = 7

    cookie_name: str = "token"
    client_origin: str = "http://localhost:5173"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_fallback_models: str = "gemini-3.5-flash-lite,gemini-3.7-flash,gemini-3.1-flash-lite"

    @property
    def fallback_models(self) -> List[str]:
        raw_list = [self.gemini_model] + [m.strip() for m in self.gemini_fallback_models.split(",") if m.strip()]
        seen = set()
        deduped = []
        for m in raw_list:
            if m and m not in seen:
                seen.add(m)
                deduped.append(m)
        return deduped

    @property
    def is_prod(self) -> bool:
        return self.node_env == "production"

    @property
    def client_origins(self) -> List[str]:
        return [o.strip() for o in self.client_origin.split(",") if o.strip()]


settings = Settings()

_required = {"MONGO_URI": settings.mongo_uri, "JWT_SECRET": settings.jwt_secret}
_missing = [k for k, v in _required.items() if not v]
if _missing:
    print(f"Missing required environment variables: {', '.join(_missing)}", file=sys.stderr)
    sys.exit(1)
