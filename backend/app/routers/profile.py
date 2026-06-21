from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Profile, User
from app.schemas import ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


def _get_or_create(db: Session, user_id: int) -> Profile:
    profile = db.get(Profile, user_id)
    if profile is None:
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=ProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_or_create(db, current_user.id)


@router.put("", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = _get_or_create(db, current_user.id)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile
