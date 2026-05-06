"""
Card Service - Business Logic for Card Management
"""

from typing import List as ListType
from sqlalchemy.orm import Session
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate
from app.services.list_service import ListService
from app.core.exceptions import NotFoundException

class CardService:
    @staticmethod
    def get_list_cards(db: Session, user_id: int, list_id: int) -> ListType[Card]:
        """Get all cards for a specific list, ensuring user owns the board."""
        # Check ownership implicitly by trying to get the list
        ListService.get_list(db, user_id, list_id)
        return db.query(Card).filter(Card.list_id == list_id).order_by(Card.position).all()

    @staticmethod
    def create_card(db: Session, user_id: int, card_in: CardCreate) -> Card:
        """Create a new card on a list."""
        # Verify list ownership
        ListService.get_list(db, user_id, card_in.list_id)
        
        db_card = Card(**card_in.model_dump())
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card

    @staticmethod
    def get_card(db: Session, user_id: int, card_id: int) -> Card:
        """Get a specific card, ensuring user owns the parent list/board."""
        db_card = db.query(Card).filter(Card.id == card_id).first()
        if not db_card:
            raise NotFoundException(message="Card not found")
            
        # Verify ownership via list
        ListService.get_list(db, user_id, db_card.list_id)
        return db_card

    @staticmethod
    def update_card(db: Session, user_id: int, card_id: int, card_in: CardUpdate) -> Card:
        """Update a card."""
        db_card = CardService.get_card(db, user_id, card_id)
        
        # If moving to a new list, verify ownership of the new list too
        if card_in.list_id is not None and card_in.list_id != db_card.list_id:
            ListService.get_list(db, user_id, card_in.list_id)
            
        update_data = card_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_card, key, value)
            
        db.commit()
        db.refresh(db_card)
        return db_card

    @staticmethod
    def delete_card(db: Session, user_id: int, card_id: int) -> None:
        """Delete a card."""
        db_card = CardService.get_card(db, user_id, card_id)
            
        db.delete(db_card)
        db.commit()
        return None
