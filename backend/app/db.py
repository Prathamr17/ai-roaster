import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models.analysis import Analysis
from app.models.resume import Resume
from app.models.resume_version import ResumeVersion
from app.models.user import User

logger = logging.getLogger("db")

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=10_000)

    try:
        db = _client.get_default_database()
    except Exception:
        db = _client.get_database("test")

    try:
        await init_beanie(
            database=db,
            document_models=[User, Resume, ResumeVersion, Analysis],
        )
        # Fail fast if the server is unreachable, mirroring the Node version.
        await _client.admin.command("ping")
        logger.info(f"MongoDB Connected: {db.name}")
    except Exception as err:
        err_msg = str(err)
        if "TLSV1_ALERT_INTERNAL_ERROR" in err_msg or "SSL handshake failed" in err_msg:
            logger.error(
                "MongoDB Atlas Connection Failed (SSL Handshake Error / Network Access Blocked).\n"
                "Reason: MongoDB Atlas rejected the connection because your current IP is not allowed in Network Access.\n"
                "Fix: Go to MongoDB Atlas (cloud.mongodb.com) -> Security -> Network Access -> Add IP Address (Allow access from anywhere '0.0.0.0/0' or add your current IP)."
            )
        raise


async def close_db() -> None:
    if _client:
        _client.close()
