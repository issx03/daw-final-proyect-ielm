"""
Boards Endpoints (Stub)
"""

from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def get_boards():
    """Get all boards - TODO: SCRUM-62"""
    return []


@router.post("/")
def create_board():
    """Create board - TODO: SCRUM-62"""
    return {"message": "TODO"}