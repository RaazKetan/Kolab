import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Determine database type from environment
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite").lower()

if DATABASE_TYPE == "postgresql":
    # Production: Use Cloud SQL PostgreSQL
    print("Using PostgreSQL (Cloud SQL) database")
    from .cloud_sql import get_cloud_sql_engine
    engine = get_cloud_sql_engine()
else:
    # Development: Use SQLite
    print("Using SQLite database")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./origin.db")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
