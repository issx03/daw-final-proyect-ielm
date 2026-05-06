"""
Lists Endpoints
"""

from typing import List as ListType
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_active_user
from app.schemas.list import ListCreate, ListUpdate, ListResponse
from app.services.list_service import ListService


router = APIRouter()


@router.post("/", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    *,
    db: Session = Depends(get_db),
    list_in: ListCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create a new list."""
    return ListService.create_list(db, current_user.id, list_in)


@router.get("/board/{board_id}", response_model=ListType[ListResponse])
def get_lists_by_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all lists for a specific board."""
    return ListService.get_board_lists(db, current_user.id, board_id)


@router.get("/{list_id}", response_model=ListResponse)
def get_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific list by ID."""
    return ListService.get_list(db, current_user.id, list_id)


@router.put("/{list_id}", response_model=ListResponse)
def update_list(
    list_id: int,
    list_in: ListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a list."""
    return ListService.update_list(db, current_user.id, list_id, list_in)


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a list."""
    ListService.delete_list(db, current_user.id, list_id)