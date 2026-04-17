"""
Integration tests for Boards CRUD
#SCRUM-62
"""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.board import Board


def test_create_board(client: TestClient, db_session: Session, auth_headers: dict):
    """Test creating a new board."""
    board_data = {
        "title": "Board de Prueba",
        "description": "Una descripción muy copada",
        "color": "#ff0000"
    }
    response = client.post("/api/v1/boards/", json=board_data, headers=auth_headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["title"] == board_data["title"]
    assert data["description"] == board_data["description"]
    assert data["color"] == board_data["color"]
    assert "id" in data
    assert "user_id" in data


def test_get_my_boards(client: TestClient, db_session: Session, auth_headers: dict):
    """Test listing only boards belonging to the current user."""
    # Get current user from DB (created by auth_headers)
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    
    # Create a board for current user
    board1 = Board(title="Mi Tablero 1", user_id=user.id)
    db_session.add(board1)
    
    # Create another board for a different user
    other_user = User(email="other@test.com", username="otheruser", password_hash="hash", is_active=True)
    db_session.add(other_user)
    db_session.flush()
    board2 = Board(title="Tablero Ajeno", user_id=other_user.id)
    db_session.add(board2)
    db_session.commit()

    response = client.get("/api/v1/boards/", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Mi Tablero 1"


def test_update_board(client: TestClient, db_session: Session, auth_headers: dict):
    """Test updating an existing board."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Título Original", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    db_session.refresh(board)
    
    update_data = {"title": "Título Nuevo", "color": "#00ff00"}
    response = client.patch(f"/api/v1/boards/{board.id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Título Nuevo"
    assert data["color"] == "#00ff00"


def test_delete_board(client: TestClient, db_session: Session, auth_headers: dict):
    """Test deleting a board."""
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    board = Board(title="Para Borrar", user_id=user.id)
    db_session.add(board)
    db_session.commit()
    db_session.refresh(board)
    
    board_id = board.id
    response = client.delete(f"/api/v1/boards/{board_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Check it's gone
    db_session.expire_all()
    deleted_board = db_session.query(Board).filter(Board.id == board_id).first()
    assert deleted_board is None


def test_board_access_denied(client: TestClient, db_session: Session, auth_headers: dict):
    """Test accessing or modifying another user's board fails."""
    # Create a board for some other user
    other_user = User(email="intruder@test.com", username="intruder", password_hash="hash", is_active=True)
    db_session.add(other_user)
    db_session.flush()
    forbidden_board = Board(title="Secreto", user_id=other_user.id)
    db_session.add(forbidden_board)
    db_session.commit()
    
    # Try to GET someone else's board
    response = client.get(f"/api/v1/boards/{forbidden_board.id}", headers=auth_headers)
    assert response.status_code == 404
    
    # Try to PATCH someone else's board
    response = client.patch(f"/api/v1/boards/{forbidden_board.id}", json={"title": "Hacked"}, headers=auth_headers)
    assert response.status_code == 404
    
    # Try to DELETE someone else's board
    response = client.delete(f"/api/v1/boards/{forbidden_board.id}", headers=auth_headers)
    assert response.status_code == 404
