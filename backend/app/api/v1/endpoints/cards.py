"""
Cards Endpoints
"""

from typing import List as ListType
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_active_user
from app.schemas.card import CardCreate, CardUpdate, CardResponse
from app.services.card_service import CardService


router = APIRouter()


@router.post("/", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    *,
    db: Session = Depends(get_db),
    card_in: CardCreate,
    current_user: User = Depends(get_current_active_user),
):
    """Create a new card."""
    return CardService.create_card(db, current_user.id, card_in)


@router.get("/list/{list_id}", response_model=ListType[CardResponse])
def get_cards_by_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all cards for a specific list."""
    return CardService.get_list_cards(db, current_user.id, list_id)


@router.get("/{card_id}", response_model=CardResponse)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific card by ID."""
    return CardService.get_card(db, current_user.id, card_id)


@router.put("/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_in: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a card."""
    return CardService.update_card(db, current_user.id, card_id, card_in)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a card."""
    CardService.delete_card(db, current_user.id, card_id)