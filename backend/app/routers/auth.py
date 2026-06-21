from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import (
    COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.models import Profile, User
from app.schemas import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: Response, user_id: int) -> None:
    token = create_access_token(user_id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # set True behind HTTPS in production
        max_age=settings.jwt_expire_days * 24 * 3600,
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.username == payload.username))
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(Profile(user_id=user.id))
    db.commit()
    db.refresh(user)

    _set_auth_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _set_auth_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
