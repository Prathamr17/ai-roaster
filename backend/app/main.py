import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.errors import ApiError
from app.db import close_db, connect_db
from app.routers import auth, dashboard, health, history, insights, resumes, versions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

app = FastAPI(title="AI Resume Roaster API", version="0.1.0", redirect_slashes=False)

# CORS - origin: true (reflect request origin) with credentials, mirroring server.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.client_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    if exc.status_code >= 500:
        logger.error(f"{request.method} {request.url.path}: {exc.message}")
    body = {"message": exc.message}
    if exc.details is not None:
        body["details"] = exc.details
    return JSONResponse(status_code=exc.status_code, content={"error": body})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error": {"message": "Validation failed", "details": exc.errors()}},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    logger.error(f"{request.method} {request.url.path}", exc_info=exc)
    body = {"message": "Internal server error"}
    if not settings.is_prod:
        body["stack"] = repr(exc)
    return JSONResponse(status_code=500, content={"error": body})


@app.on_event("startup")
async def on_startup():
    try:
        await connect_db()
    except Exception as err:  # noqa: BLE001
        logger.error(f"Failed to start server: {err}")
        raise


@app.on_event("shutdown")
async def on_shutdown():
    await close_db()


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(history.router)
app.include_router(versions.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "ai-resume-roaster-backend"}
