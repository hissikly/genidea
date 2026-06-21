from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ---------- Auth ----------
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    created_at: datetime


# ---------- Startup ----------
class StartupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    yc_id: int
    name: str
    tagline: str
    description: str
    website: str
    batch: str
    year: int | None
    status: str
    team_size: int | None
    location: str
    tags: list
    industries: list
    logo_url: str


class StartupList(BaseModel):
    total: int
    items: list[StartupOut]


# ---------- Favorites ----------
class FavoriteCreate(BaseModel):
    startup_id: int


# ---------- Profile ----------
class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    preferred_industries: list
    default_creativity: int
    default_absurdity: int


class ProfileUpdate(BaseModel):
    preferred_industries: list[str] | None = None
    default_creativity: int | None = Field(default=None, ge=0, le=100)
    default_absurdity: int | None = Field(default=None, ge=0, le=100)


# ---------- Ideas ----------
class IdeaGenerateRequest(BaseModel):
    mode: Literal["B", "C", "D"]
    language: Literal["ru", "en"] = "ru"
    creativity: int = Field(default=50, ge=0, le=100)
    absurdity: int = Field(default=20, ge=0, le=100)
    count: int = Field(default=3, ge=1, le=10)
    industry: str | None = None  # mode D
    favorite_ids: list[int] | None = None  # mode B (optional subset)


class IdeaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    mode: str
    params: dict
    idea_text: str
    created_at: datetime
