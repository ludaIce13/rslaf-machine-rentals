from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# For production, use Postgres e.g.:
# DATABASE_URL = "postgresql+psycopg://user:pass@host:5432/smartrentals"
# Prefer environment variable if provided, otherwise default to local SQLite file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartrentals.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
