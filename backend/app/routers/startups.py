from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Startup
from app.schemas import StartupList, StartupOut

router = APIRouter(prefix="/startups", tags=["startups"])


@router.get("", response_model=StartupList)
def list_startups(
    db: Session = Depends(get_db),
    search: str | None = None,
    batch: str | None = None,
    year: int | None = None,
    tag: str | None = None,
    industry: str | None = None,
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    stmt = select(Startup)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(Startup.name.ilike(like), Startup.description.ilike(like))
        )
    if batch:
        stmt = stmt.where(Startup.batch == batch)
    if year is not None:
        stmt = stmt.where(Startup.year == year)
    if tag:
        stmt = stmt.where(Startup.tags.contains(tag))
    if industry:
        stmt = stmt.where(Startup.industries.contains(industry))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    items = db.scalars(
        stmt.order_by(Startup.year.desc().nulls_last(), Startup.name)
        .limit(limit)
        .offset(offset)
    ).all()
    return StartupList(total=total or 0, items=items)


@router.get("/random", response_model=list[StartupOut])
def random_startups(
    db: Session = Depends(get_db),
    count: int = Query(default=5, ge=1, le=20),
    batch: str | None = None,
    year: int | None = None,
):
    stmt = select(Startup)
    if batch:
        stmt = stmt.where(Startup.batch == batch)
    if year is not None:
        stmt = stmt.where(Startup.year == year)
    return db.scalars(stmt.order_by(func.random()).limit(count)).all()


@router.get("/batches", response_model=list[str])
def list_batches(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Startup.batch)
        .where(Startup.batch != "")
        .distinct()
        .order_by(Startup.batch)
    ).all()
    return rows


@router.get("/{startup_id}", response_model=StartupOut)
def get_startup(startup_id: int, db: Session = Depends(get_db)):
    startup = db.get(Startup, startup_id)
    if startup is None:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startup
