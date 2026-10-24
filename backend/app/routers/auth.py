from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.core.deps import require_auth
from app.core.errors import ApiError
from app.core.rate_limit import auth_limiter
from app.core.security import cookie_kwargs, hash_password, sign_token, verify_password
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileBody(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class PasswordBody(BaseModel):
    current_password: str = Field(min_length=1, max_length=128, alias="currentPassword")
    new_password: str = Field(min_length=8, max_length=128, alias="newPassword")

    class Config:
        populate_by_name = True


def _issue_session(response: Response, user: User) -> str:
    token = sign_token({"sub": str(user.id)})
    response.set_cookie(settings.cookie_name, token, **cookie_kwargs())
    return token


@router.post("/register", status_code=201, dependencies=[Depends(auth_limiter)])
async def register(body: RegisterBody, response: Response):
    existing = await User.find_one(User.email == body.email.lower())
    if existing:
        raise ApiError.conflict("Email already registered")

    user = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
    )
    await user.insert()

    token = _issue_session(response, user)
    return {"user": user.to_public(), "token": token}


@router.post("/login", dependencies=[Depends(auth_limiter)])
async def login(body: LoginBody, response: Response):
    user = await User.find_one(User.email == body.email.lower())
    if not user:
        raise ApiError.unauthorized("Invalid credentials")

    if not verify_password(body.password, user.password_hash):
        raise ApiError.unauthorized("Invalid credentials")

    token = _issue_session(response, user)
    return {"user": user.to_public(), "token": token}



@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.cookie_name, path="/")
    return {"ok": True}


@router.get("/me")
async def me(user: User = Depends(require_auth)):
    return {"user": user.to_public()}


@router.patch("/profile")
async def update_profile(body: ProfileBody, user: User = Depends(require_auth)):
    user.name = body.name
    await user.save()
    return {"user": user.to_public()}


@router.patch("/password", dependencies=[Depends(auth_limiter)])
async def update_password(body: PasswordBody, user: User = Depends(require_auth)):
    if not verify_password(body.current_password, user.password_hash):
        raise ApiError.unauthorized("Current password is incorrect")

    user.password_hash = hash_password(body.new_password)
    await user.save()
    return {"ok": True}
