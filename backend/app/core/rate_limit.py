import time
from collections import defaultdict
from typing import Optional

from fastapi import Request

from app.core.errors import ApiError

# Simple in-memory sliding-window rate limiter (single-process),
# equivalent in spirit to express-rate-limit used in the original backend.
_buckets: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    if request.client:
        return request.client.host
    return "unknown"


def _check(key: str, window_seconds: int, limit: int, message: str) -> None:
    now = time.time()
    bucket = _buckets[key]
    cutoff = now - window_seconds
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    if len(bucket) >= limit:
        raise ApiError.too_many(message)
    bucket.append(now)


async def analyze_limiter(request: Request) -> None:
    # requireAuth should already have populated request.state.user via an
    # earlier dependency on the same route.
    user = getattr(request.state, "user", None)
    key = f"analyze:{user.id if user else _client_ip(request)}"
    _check(key, 60, 5, "Too many analyses \u2013 please wait a minute and retry.")


async def auth_limiter(request: Request) -> None:
    key = f"auth:{_client_ip(request)}"
    _check(key, 15 * 60, 30, "Too many auth attempts \u2013 please wait and retry.")
