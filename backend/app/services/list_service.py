"""
List Service - Business Logic for List Management
"""

from typing import List as ListType
from sqlalchemy.orm import Session
from app.models.list import List
from app.schemas.list import ListCreate, ListUpdate
from app.services.board_service import BoardService
from app.core.exceptions import NotFoundException

class ListService:
    @staticmethod
    def get_board_lists(db: Session, user_id: int, board_id: int) -> ListType[List]:
        """Get all lists for a specific board, ensuring user owns the board."""
        # Check ownership implicitly
        BoardService.get_board(db, user_id, board_id)
        return db.query(List).filter(List.board_id == board_id).order_by(List.position).all()

    @staticmethod
    def create_list(db: Session, user_id: int, list_in: ListCreate) -> List:
        """Create a new list on a board."""
        # Verify board ownership
        BoardService.get_board(db, user_id, list_in.board_id)
        
        db_list = List(**list_in.model_dump())
        db.add(db_list)
        db.commit()
        db.refresh(db_list)
        return db_list

    @staticmethod
    def get_list(db: Session, user_id: int, list_id: int) -> List:
        """Get a specific list, ensuring user owns the parent board."""
        db_list = db.query(List).filter(List.id == list_id).first()
        if not db_list:
            raise NotFoundException(message="List not found")
            
        # Verify ownership via board
        BoardService.get_board(db, user_id, db_list.board_id)
        return db_list

    @staticmethod
    def update_list(db: Session, user_id: int, list_id: int, list_in: ListUpdate) -> List:
        """Update a list."""
        db_list = ListService.get_list(db, user_id, list_id)
            
        update_data = list_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_list, key, value)
            
        db.commit()
        db.refresh(db_list)
        return db_list

    @staticmethod
    def delete_list(db: Session, user_id: int, list_id: int) -> None:
        """Delete a list."""
        db_list = ListService.get_list(db, user_id, list_id)
            
        db.delete(db_list)
        db.commit()
        return None
