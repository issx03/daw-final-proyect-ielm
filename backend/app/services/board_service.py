"""
Board Service - Business Logic for Board Management
"""

from typing import List
from sqlalchemy.orm import Session
from app.models.board import Board
from app.schemas.board import BoardCreate, BoardUpdate
from app.core.exceptions import NotFoundException

class BoardService:
    @staticmethod
    def get_user_boards(db: Session, user_id: int) -> List[Board]:
        """Get all boards belonging to a specific user."""
        return db.query(Board).filter(Board.user_id == user_id).all()

    @staticmethod
    def create_board(db: Session, user_id: int, board_in: BoardCreate) -> Board:
        """Create a new board for the user."""
        board = Board(
            **board_in.model_dump(),
            user_id=user_id
        )
        db.add(board)
        db.commit()
        db.refresh(board)
        return board

    @staticmethod
    def get_board(db: Session, user_id: int, board_id: int) -> Board:
        """Get a specific board (only if owner)."""
        board = db.query(Board).filter(
            Board.id == board_id,
            Board.user_id == user_id
        ).first()
        
        if not board:
            raise NotFoundException(message="Board not found")
        return board

    @staticmethod
    def update_board(db: Session, user_id: int, board_id: int, board_in: BoardUpdate) -> Board:
        """Update a board (only if owner)."""
        board = BoardService.get_board(db, user_id, board_id)
            
        update_data = board_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(board, key, value)
            
        db.commit()
        db.refresh(board)
        return board

    @staticmethod
    def delete_board(db: Session, user_id: int, board_id: int) -> None:
        """Delete a board (only if owner)."""
        board = BoardService.get_board(db, user_id, board_id)
            
        db.delete(board)
        db.commit()
        return None
