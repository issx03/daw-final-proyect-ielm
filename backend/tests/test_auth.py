"""
Tests for basic API structure (SCRUM-57)
"""

import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client):
    """Test health endpoint returns healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_endpoint(client):
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data


def test_login_user(client):
    """Test user login."""
    # First register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "password123"
        }
    )
    
    # Then login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "loginuser",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_email(client):
    """Test user login with email instead of username."""
    # First register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "email_login@example.com",
            "username": "emaillogin",
            "password": "password123"
        }
    )
    
    # Then login with email
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "email_login@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent",
            "password": "wrongpass"
        }
    )
    assert response.status_code == 401
    data = response.json()
    assert "message" in data
    assert data["error_code"] == "UNAUTHORIZED"


def test_register_duplicate_email(client):
    """Test registering with an existing email."""
    # Register first
    user_data = {
        "email": "dup@example.com",
        "username": "dup",
        "password": "password123"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Try again
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    data = response.json()
    assert data["message"] == "Email already registered"
    assert data["error_code"] == "BAD_REQUEST"


def test_get_me_authenticated(auth_headers, client):
    """Test getting current user info."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"


def test_unauthorized_access(client):
    """Test accessing protected endpoint without token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401