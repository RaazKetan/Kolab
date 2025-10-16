from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    name: str
    email: EmailStr
    password: str
    skills: List[str]
    bio: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    email: str
    skills: List[str]
    embedding_summary: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class ProjectCreate(BaseModel):
    title: str
    summary: str
    repo_url: Optional[str]
    languages: List[str]
    frameworks: List[str]
    project_type: str
    domains: List[str]
    skills: List[str]
    complexity: str
    roles: List[str]

class ProjectResponse(BaseModel):
    id: int
    title: str
    summary: str
    repo_url: Optional[str]
    languages: List[str]
    frameworks: List[str]
    project_type: str
    domains: List[str]
    skills: List[str]
    complexity: str
    roles: List[str]
    embedding_summary: Optional[str]
    owner_id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class SwipeCreate(BaseModel):
    project_id: int
    is_like: bool

class SwipeResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    is_like: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
