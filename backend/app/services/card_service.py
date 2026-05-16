"""
Card Service - Business Logic for Card Management
"""

from typing import List as ListType
from sqlalchemy.orm import Session
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate, CardMove
from app.services.list_service import ListService
from app.core.exceptions import NotFoundException

class CardService:
    @staticmethod
    def get_list_cards(db: Session, user_id: int, list_id: int) -> ListType[Card]:
        """Get all cards for a specific list, ensuring user owns the board."""
        # Check ownership implicitly by trying to get the list
        ListService.get_list(db, user_id, list_id)
        return db.query(Card).filter(Card.list_id == list_id).order_by(Card.position).all()

    DEFAULT_POSITION_GAP = 1000.0
    COLLISION_THRESHOLD = 0.001

    @staticmethod
    def create_card(db: Session, user_id: int, card_in: CardCreate) -> Card:
        """Create a new card on a list with auto-position at end."""
        # Verify list ownership
        ListService.get_list(db, user_id, card_in.list_id)
        
        # Get highest position and add gap
        existing_cards = db.query(Card).filter(
            Card.list_id == card_in.list_id
        ).order_by(Card.position).all()
        
        if existing_cards:
            max_position = existing_cards[-1].position + CardService.DEFAULT_POSITION_GAP
        else:
            max_position = CardService.DEFAULT_POSITION_GAP
        
        card_data = card_in.model_dump()
        card_data['position'] = max_position
        
        db_card = Card(**card_data)
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
    def move_card(db: Session, user_id: int, card_id: int, move_data: CardMove) -> Card:
        """Move a card to a new position with float-based midpoint insertion."""
        db_card = CardService.get_card(db, user_id, card_id)
        
        # Verify ownership of target list
        ListService.get_list(db, user_id, move_data.list_id)
        
        # Get target list cards ordered by position (excluding the card being moved)
        target_cards = db.query(Card).filter(
            Card.list_id == move_data.list_id,
            Card.id != card_id
        ).order_by(Card.position).all()
        
        new_index = move_data.position
        num_cards = len(target_cards)
        
        # Calculate new position using midpoint insertion
        if num_cards == 0:
            # Empty list
            new_position = CardService.DEFAULT_POSITION_GAP
        elif new_index <= 0:
            # Insert at beginning
            new_position = target_cards[0].position / 2.0
        elif new_index >= num_cards:
            # Insert at end
            new_position = target_cards[-1].position + CardService.DEFAULT_POSITION_GAP
        else:
            # Insert between two cards
            prev_card = target_cards[new_index - 1]
            next_card = target_cards[new_index]
            new_position = (prev_card.position + next_card.position) / 2.0
        
        # Check for collision (positions too close)
        needs_renormalize = False
        for c in target_cards:
            if abs(c.position - new_position) < CardService.COLLISION_THRESHOLD:
                needs_renormalize = True
                break
        
        if needs_renormalize:
            # Renormalize all positions in target list
            for i, c in enumerate(target_cards):
                c.position = float((i + 1) * CardService.DEFAULT_POSITION_GAP)
            
            # Recalculate new position after renormalization
            if new_index <= 0:
                new_position = CardService.DEFAULT_POSITION_GAP / 2.0
            elif new_index >= num_cards:
                new_position = (num_cards + 1) * CardService.DEFAULT_POSITION_GAP
            else:
                new_position = (new_index + 0.5) * CardService.DEFAULT_POSITION_GAP
        
        # Update card
        db_card.list_id = move_data.list_id
        db_card.position = new_position
        
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
