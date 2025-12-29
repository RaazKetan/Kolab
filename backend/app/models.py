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
    org_type = Column(String)  # "college" | "company"
    org_name = Column(String)
    github_profile_url = Column(String)
    github_selected_repos = Column(JSON)  # [{"url": str, "name": str}] max 5
    activity_score = Column(Integer)  # derived (0-100)
    top_languages = Column(JSON)  # ["Python", "TS"]
    top_frameworks = Column(JSON)  # ["FastAPI","React"]
    user_vector = Column(JSON)  # embedding vector for semantic matching


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
    project_vector = Column(JSON)  # embedding vector for semantic matching


class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    project_id = Column(Integer, index=True)
    is_like = Column(Boolean)
    approved_by_owner = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    from_user_id = Column(Integer, index=True)
    to_user_id = Column(Integer, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    title = Column(String)  # e.g., "Senior Software Engineer"
    location = Column(String)  # e.g., "San Francisco, CA"
    experience_years = Column(Integer)  # Total years of experience
    current_company = Column(String)
    current_role = Column(String)
    work_history = Column(JSON)  # [{company, role, duration, description}]
    skills = Column(JSON)  # ["Python", "React", "AWS"]
    certifications = Column(JSON)  # ["AWS Certified", "Google Cloud Professional"]
    education = Column(JSON)  # [{degree, institution, year}]
    summary = Column(Text)  # Resume summary/bio
    candidate_vector = Column(JSON)  # Embedding vector for semantic matching
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, index=True)  # Foreign key to Candidate
    interview_transcript = Column(Text)  # Raw interview transcript
    target_role = Column(String)  # Role being evaluated for
    required_skills = Column(JSON)  # Skills needed for target role
    current_skills = Column(JSON)  # Skills demonstrated in interview
    skill_gaps = Column(JSON)  # Identified gaps with proficiency levels
    strengths = Column(JSON)  # Areas where candidate excels
    learning_roadmap = Column(JSON)  # Structured learning path with timeline
    recommended_courses = Column(JSON)  # Course recommendations
    readiness_score = Column(Integer)  # 0-100 score
    deployment_timeline = Column(String)  # Estimated time to readiness
    analysis_summary = Column(Text)  # AI-generated summary
    analyzed_by_user_id = Column(Integer, index=True)  # User who ran analysis
    created_at = Column(DateTime(timezone=True), server_default=func.now())
