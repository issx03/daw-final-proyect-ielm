"""
Database Base and Session
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    # Import all models here to register them
    from app.models.user import User  # noqa: F401
    from app.models.board import Board  # noqa: F401
    from app.models.list import List  # noqa: F401
    from app.models.card import Card  # noqa: F401
    
    Base.metadata.create_all(bind=engine)