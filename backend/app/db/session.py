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
    """Initialize database tables and seed default admin if none exists."""
    # Import all models here to register them
    from app.models.user import User  # noqa: F401
    from app.models.board import Board  # noqa: F401
    from app.models.list import List  # noqa: F401
    from app.models.card import Card  # noqa: F401
    
    Base.metadata.create_all(bind=engine)
    
    # Seed admin user if no admin exists
    from app.core.config import settings
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if not existing_admin:
            admin = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()