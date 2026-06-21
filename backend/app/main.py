from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, favorites, ideas, profile, startups

Base.metadata.create_all(bind=engine)

app = FastAPI(title="YC Startup Idea Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(startups.router)
app.include_router(favorites.router)
app.include_router(ideas.router)
app.include_router(profile.router)


@app.get("/health")
def health():
    return {"status": "ok"}
