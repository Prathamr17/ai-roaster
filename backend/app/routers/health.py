import time
from datetime import datetime, timezone

from fastapi import APIRouter

from app import db as db_module

router = APIRouter(prefix="/api/health", tags=["health"])

_start_time = time.time()


@router.get("")
@router.get("/", include_in_schema=False)
async def health():
    db_state = "disconnected"
    if db_module._client is not None:
        try:
            await db_module._client.admin.command("ping")
            db_state = "connected"
        except Exception:  # noqa: BLE001
            db_state = "disconnected"

    return {
        "status": "ok",
        "uptime": time.time() - _start_time,
        "db": db_state,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
