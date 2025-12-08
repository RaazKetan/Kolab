from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from datetime import datetime

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    org_type: Optional[Literal["college", "company"]] = None
    org_name: Optional[str] = None
    github_profile_url: Optional[str] = None
    github_selected_repos: Optional[List[str]] = None 

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
    org_type: Optional[str] = None
    org_name: Optional[str] = None
    github_profile_url: Optional[str] = None
    github_selected_repos: Optional[List[dict]] = None
    activity_score: Optional[int] = None
    top_languages: Optional[List[str]] = None
    top_frameworks: Optional[List[str]] = None
    class Config:
        from_attributes = True

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
    # Match scoring fields
    match_score: Optional[float] = None
    match_strength: Optional[str] = None
    is_reshow: Optional[bool] = None
    class Config:
        from_attributes = True

class OwnerMatchItem(BaseModel):
    # Project plus the user who liked it
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
    liked_by_user_id: int
    approved_by_owner: bool | None = False

class SwipeCreate(BaseModel):
    project_id: int
    is_like: bool

class SwipeResponse(BaseModel):
    id: int
    user_id: int
    project_id: int
    is_like: bool
    approved_by_owner: bool | None = False
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class CreateProjectFromRepo(BaseModel):
    repo_url: str

class ProjectAnalyzeResponse(BaseModel):
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

class ApproveLike(BaseModel):
    project_id: int
    liker_user_id: int

class DiscoverFilters(BaseModel):
    skills: Optional[List[str]] = None
    domains: Optional[List[str]] = None
    complexity: Optional[List[str]] = None
    languages: Optional[List[str]] = None

class ChatMessageCreate(BaseModel):
    project_id: int
    to_user_id: int
    content: str

class ChatMessageResponse(BaseModel):
    id: int
    project_id: int
    from_user_id: int
    to_user_id: int
    content: str
    created_at: datetime
    class Config:
        from_attributes = True
