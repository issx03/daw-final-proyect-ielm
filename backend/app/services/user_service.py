"""
User Service - Business Logic for User Management
"""

from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash
from app.schemas.user import UserCreate
from app.core.exceptions import BadRequestException

class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        """Register a new user."""
        # Check if email exists
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise BadRequestException(message="Email already registered")
        
        # Check if username exists
        existing = db.query(User).filter(User.username == user_in.username).first()
        if existing:
            raise BadRequestException(message="Username already taken")
        
        # Create user
        db_user = User(
            email=user_in.email,
            username=user_in.username,
            password_hash=get_password_hash(user_in.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
