"""
Auth Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user_id,
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserMeUpdate
from app.schemas.token import Token
from app.models.user import User
from app.core.exceptions import (
    BadRequestException, 
    UnauthorizedException, 
    NotFoundException, 
    ForbiddenException
)
from app.services.user_service import UserService


router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    return UserService.create_user(db=db, user_in=user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return access token."""
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise UnauthorizedException(message="Incorrect username, email or password")
    
    if not user.is_active:
        raise BadRequestException(message="Your account has been blocked. Please contact support.")
    
    access_token = create_access_token(data={"user_id": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_active_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """Get current active user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(message="User not found")
    if not user.is_active:
        raise BadRequestException(message="Inactive user")
    return user


def get_current_active_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current active admin."""
    if current_user.role != "admin":
        raise ForbiddenException(message="Not enough privileges")
    return current_user


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_active_user)):
    """Get current user."""
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_update: UserMeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile."""
    # Check uniqueness if email is changed
    if user_update.email and user_update.email != current_user.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise BadRequestException(message="Email already registered")
            
    # Check uniqueness if username is changed
    if user_update.username and user_update.username != current_user.username:
        existing = db.query(User).filter(User.username == user_update.username).first()
        if existing:
            raise BadRequestException(message="Username already taken")
            
    # Apply updates
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        current_user.password_hash = get_password_hash(password)
        
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete current user account."""
    db.delete(current_user)
    db.commit()
    return None