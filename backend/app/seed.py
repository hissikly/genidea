"""Populate the database with YC startups fetched from Algolia.

Usage:
    python -m app.seed
"""

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Startup
from app.scraper.yc_algolia import fetch_all_companies


def run() -> None:
    Base.metadata.create_all(bind=engine)
    print("Fetching YC companies from Algolia...")
    companies = fetch_all_companies()
    print(f"Fetched {len(companies)} companies.")

    inserted = 0
    updated = 0
    with SessionLocal() as db:
        for rec in companies:
            if not rec.get("yc_id"):
                continue
            existing = db.scalar(
                select(Startup).where(Startup.yc_id == rec["yc_id"])
            )
            if existing:
                for key, value in rec.items():
                    setattr(existing, key, value)
                updated += 1
            else:
                db.add(Startup(**rec))
                inserted += 1
        db.commit()

    print(f"Done. Inserted: {inserted}, Updated: {updated}.")


if __name__ == "__main__":
    run()
