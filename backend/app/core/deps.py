import jwt
from fastapi import Request

from app.config import settings
from app.core.errors import ApiError
from app.core.security import verify_token
from app.models.user import User


async def require_auth(request: Request) -> User:
    candidates = []

    # 1. Bearer token in Authorization header (standard for SPAs / cross-origin)
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        header_token = auth_header.split(" ", 1)[1].strip()
        if header_token:
            candidates.append(header_token)

    # 2. Cookie token fallback
    cookie_token = request.cookies.get(settings.cookie_name)
    if cookie_token and cookie_token not in candidates:
        candidates.append(cookie_token)

    if not candidates:
        raise ApiError.unauthorized("Authentication required")

    last_error = None
    for token in candidates:
        try:
            payload = verify_token(token)
            sub = payload.get("sub")
            if not sub:
                continue
            user = await User.get(sub)
            if user:
                request.state.user = user
                return user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as err:
            last_error = err
            continue

    if last_error:
        raise ApiError.unauthorized("Invalid or expired session")
    raise ApiError.unauthorized("Session no longer valid")
