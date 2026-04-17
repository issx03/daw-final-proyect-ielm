"""
User Management Endpoints (Admin only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.api.v1.endpoints.auth import get_current_active_admin

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """List all users (Admin only)."""
    return db.query(User).all()

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Delete a user (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admin cannot delete themselves")
        
    db.delete(user)
    db.commit()
    return None

@router.patch("/{user_id}/block", response_model=UserResponse)
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Block a user (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admin cannot block themselves")
        
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/unblock", response_model=UserResponse)
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Unblock a user (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
