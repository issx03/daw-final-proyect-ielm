"""
User Schemas
"""

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    username: str
    avatar: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None
    avatar: str | None = None


class UserMeUpdate(BaseModel):
    """
    Schema for updating the current user's own profile.
    Excludes administrative fields (role, is_active) to prevent privilege escalation.
    """
    email: EmailStr | None = None
    username: str | None = None
    password: str | None = None
    avatar: str | None = None



class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True
