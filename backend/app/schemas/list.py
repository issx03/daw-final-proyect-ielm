"""
List Schemas
"""

from pydantic import BaseModel


class ListBase(BaseModel):
    title: str
    position: int = 0


class ListCreate(ListBase):
    board_id: int


class ListUpdate(BaseModel):
    title: str | None = None
    position: int | None = None


class ListResponse(ListBase):
    id: int
    board_id: int

    class Config:
        from_attributes = True

from typing import List
from app.schemas.card import CardResponse

class ListDetailResponse(ListResponse):
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True
