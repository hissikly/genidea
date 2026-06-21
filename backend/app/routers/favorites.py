from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Favorite, Startup, User
from app.schemas import FavoriteCreate, StartupOut

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[StartupOut])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Startup)
        .join(Favorite, Favorite.startup_id == Startup.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    return db.scalars(stmt).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def add_favorite(
    payload: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.get(Startup, payload.startup_id):
        raise HTTPException(status_code=404, detail="Startup not found")

    exists = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.startup_id == payload.startup_id,
        )
    )
    if exists:
        return {"detail": "Already in favorites"}

    db.add(Favorite(user_id=current_user.id, startup_id=payload.startup_id))
    db.commit()
    return {"detail": "Added"}


@router.delete("/{startup_id}")
def remove_favorite(
    startup_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fav = db.scalar(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.startup_id == startup_id,
        )
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Not in favorites")
    db.delete(fav)
    db.commit()
    return {"detail": "Removed"}
