"""
Cards Endpoints (Stub)
"""

from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def get_cards():
    """Get cards - TODO: SCRUM-62"""
    return []


@router.post("/")
def create_card():
    """Create card - TODO: SCRUM-62"""
    return {"message": "TODO"}