import jwt
from fastapi import Request

from app.config import settings
from app.core.errors import ApiError
from app.core.security import verify_token
from app.models.user import User


async def require_auth(request: Request) -> User:
    token = request.cookies.get(settings.cookie_name)
    if not token:
        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        raise ApiError.unauthorized()

    try:
        payload = verify_token(token)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise ApiError.unauthorized("Invalid or expired session")

    user = await User.get(payload.get("sub"))
    if not user:
        raise ApiError.unauthorized("Session no longer valid")

    request.state.user = user
    return user
