"""
Card Schemas
"""

from pydantic import BaseModel


class CardBase(BaseModel):
    title: str
    description: str | None = None
    position: float = 1000.0
    priority: str = "medium"
    labels: list[str] = []


class CardCreate(CardBase):
    list_id: int


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    position: float | None = None
    list_id: int | None = None
    priority: str | None = None
    labels: list[str] | None = None


class CardMove(BaseModel):
    list_id: int
    position: int


class CardResponse(CardBase):
    id: int
    list_id: int
    priority: str | None = "medium"
    labels: list[str] | None = []

    class Config:
        from_attributes = True
