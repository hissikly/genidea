from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    ideas: Mapped[list["GeneratedIdea"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    profile: Mapped["Profile"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )


class Startup(Base):
    __tablename__ = "startups"

    id: Mapped[int] = mapped_column(primary_key=True)
    yc_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    tagline: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    website: Mapped[str] = mapped_column(String(500), default="")
    batch: Mapped[str] = mapped_column(String(20), default="", index=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="")
    team_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    location: Mapped[str] = mapped_column(String(255), default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    industries: Mapped[list] = mapped_column(JSON, default=list)
    logo_url: Mapped[str] = mapped_column(String(500), default="")


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "startup_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    startup_id: Mapped[int] = mapped_column(ForeignKey("startups.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped["User"] = relationship(back_populates="favorites")
    startup: Mapped["Startup"] = relationship()


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    preferred_industries: Mapped[list] = mapped_column(JSON, default=list)
    default_creativity: Mapped[int] = mapped_column(Integer, default=50)
    default_absurdity: Mapped[int] = mapped_column(Integer, default=20)

    user: Mapped["User"] = relationship(back_populates="profile")


class GeneratedIdea(Base):
    __tablename__ = "generated_ideas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    mode: Mapped[str] = mapped_column(String(20))  # B / C / D
    params: Mapped[dict] = mapped_column(JSON, default=dict)
    idea_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped["User"] = relationship(back_populates="ideas")
