"""
Boards Endpoints
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse
from app.api.v1.endpoints.auth import get_current_active_user
from app.services.board_service import BoardService

router = APIRouter()


@router.get("/", response_model=List[BoardResponse])
def get_my_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all boards belonging to the current user."""
    return BoardService.get_user_boards(db, current_user.id)


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    board_in: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new board for the current user."""
    return BoardService.create_board(db, current_user.id, board_in)


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific board (only if owner)."""
    return BoardService.get_board(db, current_user.id, board_id)


@router.patch("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    board_in: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a board (only if owner)."""
    return BoardService.update_board(db, current_user.id, board_id, board_in)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a board (only if owner)."""
    BoardService.delete_board(db, current_user.id, board_id)
    return None