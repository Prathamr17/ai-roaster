from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import bcrypt
import jwt

from app.config import settings

ALGORITHM = "HS256"


def sign_token(payload: Dict[str, Any]) -> str:
    to_encode = payload.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expires_in_days)
    to_encode["iat"] = datetime.now(timezone.utc)
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


# Cookie options mirroring cookieOptions in jwt.js
COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60


def cookie_kwargs() -> Dict[str, Any]:
    return {
        "httponly": True,
        "secure": settings.is_prod,
        "samesite": "none" if settings.is_prod else "lax",
        "max_age": COOKIE_MAX_AGE_SECONDS,
        "path": "/",
    }
