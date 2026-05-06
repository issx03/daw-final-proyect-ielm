"""
Integration tests for Cards CRUD
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.board import Board
from app.models.list import List
from app.models.card import Card


def test_create_card(client: TestClient, db_session: Session, auth_headers: dict):
    """Test creating a new card on a list."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id)
    db_session.add(list1)
    db_session.commit()
    
    card_data = {
        "title": "New Task",
        "description": "Details about the task",
        "list_id": list1.id,
        "position": 0
    }
    response = client.post("/api/v1/cards/", json=card_data, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["title"] == card_data["title"]
    assert data["description"] == card_data["description"]
    assert data["list_id"] == card_data["list_id"]
    assert data["position"] == card_data["position"]


def test_get_cards_by_list(client: TestClient, db_session: Session, auth_headers: dict):
    """Test getting all cards for a specific list."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id)
    db_session.add(list1)
    db_session.commit()
    
    card1 = Card(title="Task 1", list_id=list1.id, position=0)
    card2 = Card(title="Task 2", list_id=list1.id, position=1)
    db_session.add_all([card1, card2])
    db_session.commit()
    
    response = client.get(f"/api/v1/cards/list/{list1.id}", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Task 1"
    assert data[1]["title"] == "Task 2"


def test_update_card(client: TestClient, db_session: Session, auth_headers: dict):
    """Test updating a card."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id)
    db_session.add(list1)
    db_session.commit()
    
    card1 = Card(title="Task 1", list_id=list1.id, position=0)
    db_session.add(card1)
    db_session.commit()
    
    update_data = {
        "title": "Task 1 Updated",
        "description": "Added description"
    }
    response = client.put(f"/api/v1/cards/{card1.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Task 1 Updated"
    assert data["description"] == "Added description"


def test_delete_card(client: TestClient, db_session: Session, auth_headers: dict):
    """Test deleting a card."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Test Board", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    
    list1 = List(title="To Do", board_id=board.id)
    db_session.add(list1)
    db_session.commit()
    
    card1 = Card(title="Task 1", list_id=list1.id, position=0)
    db_session.add(card1)
    db_session.commit()
    
    response = client.delete(f"/api/v1/cards/{card1.id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify deletion
    card_in_db = db_session.query(Card).filter(Card.id == card1.id).first()
    assert card_in_db is None
