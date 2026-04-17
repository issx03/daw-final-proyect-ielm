"""
Tests for Admin endpoints and RBAC (SCRUM-60)
"""

import pytest
from app.models.user import User
from app.core.security import get_password_hash

def test_admin_list_users_forbidden_for_regular_user(client, auth_headers):
    response = client.get("/api/v1/users", headers=auth_headers)
    assert response.status_code == 403

def test_admin_can_list_users(client, db_session):
    # Create an admin user manually
    admin_data = {
        "email": "admin@example.com",
        "username": "admin",
        "password_hash": get_password_hash("adminpass"),
        "role": "admin",
        "is_active": True
    }
    db_admin = User(**admin_data)
    db_session.add(db_admin)
    db_session.commit()
    
    # Login as admin
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin", "password": "adminpass"}
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # List users
    response = client.get("/api/v1/users", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_admin_can_block_user(client, db_session):
    # Setup admin
    admin = User(email="adm@ex.com", username="adm", password_hash=get_password_hash("p"), role="admin")
    # Setup regular user
    user = User(email="usr@ex.com", username="usr", password_hash=get_password_hash("p"), role="user")
    db_session.add_all([admin, user])
    db_session.commit()
    
    # Login as admin
    login_res = client.post("/api/v1/auth/login", data={"username": "adm", "password": "p"})
    token = login_res.json()["access_token"]
    
    # Block user
    response = client.patch(
        f"/api/v1/users/{user.id}/block",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False

def test_blocked_user_cannot_login(client, db_session):
    # Create blocked user
    user = User(
        email="blocked@ex.com", 
        username="blocked", 
        password_hash=get_password_hash("p"), 
        is_active=False
    )
    db_session.add(user)
    db_session.commit()
    
    # Attempt login
    response = client.post("/api/v1/auth/login", data={"username": "blocked", "password": "p"})
    assert response.status_code == 400
    assert "inactive" in response.json()["detail"].lower()
