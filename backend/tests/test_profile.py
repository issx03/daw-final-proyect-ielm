"""
Tests for User Profile Management (SCRUM-61)
"""

import pytest
from app.models.user import User
from app.core.security import get_password_hash

def test_update_me_profile_successfully(client, auth_headers, db_session):
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"username": "newusername", "email": "new@example.com"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "newusername"
    assert response.json()["email"] == "new@example.com"

def test_update_me_password(client, auth_headers, db_session):
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"password": "newsecurepassword123"}
    )
    assert response.status_code == 200
    
    # Try login with new password
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "newsecurepassword123"}
    )
    assert response.status_code == 200

def test_update_me_email_conflict(client, auth_headers, db_session):
    # Create another user
    other = User(
        email="other@example.com", 
        username="otheruser", 
        password_hash=get_password_hash("pass")
    )
    db_session.add(other)
    db_session.commit()
    
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"email": "other@example.com"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["message"].lower()
    assert response.json()["error_code"] == "BAD_REQUEST"

def test_delete_me(client, auth_headers, db_session):
    response = client.delete("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify user is gone
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 404


def test_update_me_ignores_admin_fields(client, auth_headers, db_session):
    """
    Ensure that attempts to update administrative fields (role, is_active)
    via PATCH /me are ignored/discarded by the schema.
    """
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"role": "admin", "is_active": False}
    )
    assert response.status_code == 200
    
    # Verify sensitive fields were not modified
    assert response.json()["role"] != "admin"
    assert response.json()["is_active"] is True
    
    # Verify the database state directly
    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user.role != "admin"
    assert user.is_active is True

