"""
Lists Endpoints (Stub)
"""

from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def get_lists():
    """Get lists - TODO: SCRUM-62"""
    return []


@router.post("/")
def create_list():
    """Create list - TODO: SCRUM-62"""
    return {"message": "TODO"}