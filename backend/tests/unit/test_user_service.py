"""
Unit tests for User Service
"""

import pytest
from unittest.mock import MagicMock
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from app.core.exceptions import BadRequestException
from app.models.user import User

def test_create_user_success(mocker):
    # Setup
    db = MagicMock()
    # Mock query to return None (user doesn't exist)
    db.query.return_value.filter.return_value.first.return_value = None
    
    user_in = UserCreate(
        email="test@example.com",
        username="testuser",
        password="securepassword"
    )
    
    # Mock password hash
    mocker.patch("app.services.user_service.get_password_hash", return_value="hashed_password")
    
    # Execute
    user = UserService.create_user(db, user_in)
    
    # Assert
    assert user.email == "test@example.com"
    assert user.username == "testuser"
    assert user.password_hash == "hashed_password"
    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_user_email_exists(mocker):
    # Setup
    db = MagicMock()
    # Mock query to return an existing user
    db.query.return_value.filter.return_value.first.return_value = User(email="test@example.com")
    
    user_in = UserCreate(
        email="test@example.com",
        username="testuser",
        password="securepassword"
    )
    
    # Execute & Assert
    with pytest.raises(BadRequestException) as exc:
        UserService.create_user(db, user_in)
    
    assert "Email already registered" in str(exc.value.message)

def test_create_user_username_exists(mocker):
    # Setup
    db = MagicMock()
    # Mock query to return None for email, but an existing user for username
    # This is a bit tricky with the chained calls, let's use side_effect
    mock_query = db.query.return_value.filter.return_value.first
    mock_query.side_effect = [None, User(username="testuser")]
    
    user_in = UserCreate(
        email="test@example.com",
        username="testuser",
        password="securepassword"
    )
    
    # Execute & Assert
    with pytest.raises(BadRequestException) as exc:
        UserService.create_user(db, user_in)
    
    assert "Username already taken" in str(exc.value.message)
