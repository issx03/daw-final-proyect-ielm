"""
Board Schemas
"""

from datetime import datetime
from pydantic import BaseModel


class BoardBase(BaseModel):
    title: str
    description: str | None = None
    color: str | None = "#0079bf"


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    color: str | None = None


class BoardResponse(BoardBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
