from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Favorite, GeneratedIdea, Startup, User
from app.schemas import IdeaGenerateRequest, IdeaOut
from app.services.ideas import generate_ideas
from app.services.llm import LLMError

router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.post("/generate", response_model=IdeaOut)
def generate(
    payload: IdeaGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = None
    if payload.mode == "B":
        stmt = (
            select(Startup)
            .join(Favorite, Favorite.startup_id == Startup.id)
            .where(Favorite.user_id == current_user.id)
        )
        if payload.favorite_ids:
            stmt = stmt.where(Startup.id.in_(payload.favorite_ids))
        favorites = db.scalars(stmt).all()
        if not favorites:
            raise HTTPException(
                status_code=400,
                detail="No favorites found to generate ideas from.",
            )

    if payload.mode == "D" and not payload.industry:
        raise HTTPException(
            status_code=400, detail="industry is required for mode D."
        )

    try:
        idea_text = generate_ideas(
            mode=payload.mode,
            count=payload.count,
            creativity=payload.creativity,
            absurdity=payload.absurdity,
            industry=payload.industry,
            favorites=favorites,
            language=payload.language,
        )
    except LLMError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    idea = GeneratedIdea(
        user_id=current_user.id,
        mode=payload.mode,
        params=payload.model_dump(),
        idea_text=idea_text,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@router.get("/history", response_model=list[IdeaOut])
def history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(GeneratedIdea)
        .where(GeneratedIdea.user_id == current_user.id)
        .order_by(GeneratedIdea.created_at.desc())
    )
    return db.scalars(stmt).all()


@router.delete("/history/{idea_id}")
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = db.get(GeneratedIdea, idea_id)
    if not idea or idea.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Idea not found")
    db.delete(idea)
    db.commit()
    return {"detail": "Deleted"}
