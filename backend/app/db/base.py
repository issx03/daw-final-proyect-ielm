"""
Database Base Declaration and Model Aggregation
"""

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here to register them with Base.metadata
from app.models.user import User  # noqa: F401
from app.models.board import Board  # noqa: F401
from app.models.list import List  # noqa: F401
from app.models.card import Card  # noqa: F401