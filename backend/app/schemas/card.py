"""
Card Schemas
"""

from pydantic import BaseModel


class CardBase(BaseModel):
    title: str
    description: str | None = None
    position: int = 0


class CardCreate(CardBase):
    list_id: int


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    position: int | None = None
    list_id: int | None = None


class CardResponse(CardBase):
    id: int
    list_id: int

    class Config:
        from_attributes = True
