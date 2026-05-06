"""
Integration tests for Lists CRUD
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.board import Board
from app.models.list import List


def test_create_list(client: TestClient, db_session: Session, auth_headers: dict):
    """Test creating a new list on a board."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list_data = {
        "title": "To Do",
        "board_id": board.id,
        "position": 0
    }
    response = client.post("/api/v1/lists/", json=list_data, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["title"] == list_data["title"]
    assert data["board_id"] == list_data["board_id"]
    assert data["position"] == list_data["position"]


def test_get_lists_by_board(client: TestClient, db_session: Session, auth_headers: dict):
    """Test getting all lists for a specific board."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id, position=0)
    list2 = List(title="Doing", board_id=board.id, position=1)
    db_session.add_all([list1, list2])
    db_session.commit()
    
    response = client.get(f"/api/v1/lists/board/{board.id}", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "To Do"
    assert data[1]["title"] == "Doing"


def test_update_list(client: TestClient, db_session: Session, auth_headers: dict):
    """Test updating a list."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id, position=0)
    db_session.add(list1)
    db_session.commit()
    
    update_data = {
        "title": "Done",
        "position": 5
    }
    response = client.put(f"/api/v1/lists/{list1.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Done"
    assert data["position"] == 5


def test_delete_list(client: TestClient, db_session: Session, auth_headers: dict):
    """Test deleting a list."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id, position=0)
    db_session.add(list1)
    db_session.commit()
    
    response = client.delete(f"/api/v1/lists/{list1.id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify deletion
    list_in_db = db_session.query(List).filter(List.id == list1.id).first()
    assert list_in_db is None
