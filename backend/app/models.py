from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    skills = Column(JSON)
    embedding_summary = Column(Text)
    bio = Column(Text)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    summary = Column(Text)
    repo_url = Column(String)
    languages = Column(JSON)
    frameworks = Column(JSON)
    project_type = Column(String)
    domains = Column(JSON)
    skills = Column(JSON)
    complexity = Column(String)
    roles = Column(JSON)
    embedding_summary = Column(Text)
    owner_id = Column(Integer, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    project_id = Column(Integer, index=True)
    is_like = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
