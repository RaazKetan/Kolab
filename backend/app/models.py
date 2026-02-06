from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from .database import Base, is_postgres


def json_column():
    """Helper to create JSON column that works with both PostgreSQL and SQLite"""
    if is_postgres:
        return Column(JSONB)
    else:
        # For SQLite, use SQLAlchemy's JSON type which handles serialization automatically
        return Column(JSON)


def vector_column(dimensions=768):
    """Helper to create vector column for PostgreSQL or JSON for SQLite"""
    if is_postgres:
        from pgvector.sqlalchemy import Vector

        return Column(Vector(dimensions))
    else:
        # For SQLite, store vectors as JSON arrays
        return Column(JSON)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    skills = json_column()
    embedding_summary = Column(Text)
    bio = Column(Text)
    avatar_url = Column(String)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    org_type = Column(String)
    org_name = Column(String)
    github_profile_url = Column(String)
    github_selected_repos = json_column()
    activity_score = Column(Integer)
    top_languages = json_column()
    top_frameworks = json_column()
    user_vector = vector_column(768)

    # Relationships
    projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan"
    )
    swipes = relationship("Swipe", back_populates="user", cascade="all, delete-orphan")
    sent_messages = relationship(
        "ChatMessage", foreign_keys="ChatMessage.from_user_id", back_populates="sender"
    )
    received_messages = relationship(
        "ChatMessage", foreign_keys="ChatMessage.to_user_id", back_populates="recipient"
    )

    if is_postgres:
        __table_args__ = (
            Index("idx_user_skills", "skills", postgresql_using="gin"),
            Index("idx_user_languages", "top_languages", postgresql_using="gin"),
            Index("idx_active_created", "is_active", "created_at"),
        )
    else:
        __table_args__ = (Index("idx_active_created", "is_active", "created_at"),)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    summary = Column(Text)
    repo_url = Column(String)
    languages = json_column()
    frameworks = json_column()
    project_type = Column(String, index=True)
    domains = json_column()
    skills = json_column()
    complexity = Column(String, index=True)
    roles = json_column()
    embedding_summary = Column(Text)
    owner_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    project_vector = vector_column(768)

    # Denormalized fields for performance
    match_count = Column(Integer, default=0)

    # Relationships
    owner = relationship("User", back_populates="projects")
    swipes = relationship(
        "Swipe", back_populates="project", cascade="all, delete-orphan"
    )
    messages = relationship(
        "ChatMessage", back_populates="project", cascade="all, delete-orphan"
    )

    if is_postgres:
        __table_args__ = (
            Index("idx_project_skills", "skills", postgresql_using="gin"),
            Index("idx_project_languages", "languages", postgresql_using="gin"),
            Index("idx_active_owner", "is_active", "owner_id"),
            Index("idx_created_active", "created_at", "is_active"),
        )
    else:
        __table_args__ = (
            Index("idx_active_owner", "is_active", "owner_id"),
            Index("idx_created_active", "created_at", "is_active"),
        )


class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    is_like = Column(Boolean, nullable=False)
    approved_by_owner = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="swipes")
    project = relationship("Project", back_populates="swipes")

    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_user_project_swipe"),
        Index("idx_user_project_swipe", "user_id", "project_id"),
        Index("idx_project_like", "project_id", "is_like"),
        Index("idx_user_like_created", "user_id", "is_like", "created_at"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    from_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    to_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    # Relationships
    project = relationship("Project", back_populates="messages")
    sender = relationship(
        "User", foreign_keys=[from_user_id], back_populates="sent_messages"
    )
    recipient = relationship(
        "User", foreign_keys=[to_user_id], back_populates="received_messages"
    )

    __table_args__ = (
        Index("idx_conversation", "project_id", "from_user_id", "to_user_id"),
        Index("idx_user_messages", "to_user_id", "created_at"),
        Index("idx_unread_messages", "to_user_id", "is_read"),
    )


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    title = Column(String, index=True)
    location = Column(String)
    experience_years = Column(Integer, index=True)
    current_company = Column(String)
    current_role = Column(String)
    work_history = json_column()
    skills = json_column()
    certifications = json_column()
    education = json_column()
    summary = Column(Text)
    candidate_vector = vector_column(768)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    skill_gap_analyses = relationship(
        "SkillGapAnalysis", back_populates="candidate", cascade="all, delete-orphan"
    )

    if is_postgres:
        __table_args__ = (
            Index("idx_candidate_skills", "skills", postgresql_using="gin"),
            Index("idx_experience_active", "experience_years", "is_active"),
        )
    else:
        __table_args__ = (
            Index("idx_experience_active", "experience_years", "is_active"),
        )


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    interview_transcript = Column(Text)
    target_role = Column(String, index=True)
    required_skills = json_column()
    current_skills = json_column()
    skill_gaps = json_column()
    strengths = json_column()
    learning_roadmap = json_column()
    recommended_courses = json_column()
    readiness_score = Column(Integer, index=True)
    deployment_timeline = Column(String)
    analysis_summary = Column(Text)
    analyzed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    candidate = relationship("Candidate", back_populates="skill_gap_analyses")
    analyzed_by = relationship("User")

    __table_args__ = (
        Index("idx_candidate_score", "candidate_id", "readiness_score"),
        Index("idx_role_score", "target_role", "readiness_score"),
    )
