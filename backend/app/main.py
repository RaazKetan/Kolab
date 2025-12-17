from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import users, projects, ai, auth, matching, profile, repo_projects, chat, requirements, analyze_repo

Base.metadata.create_all(bind=engine)
app = FastAPI(title="CollabFoundry API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(ai.router)
app.include_router(matching.router)
app.include_router(profile.router)
app.include_router(repo_projects.router)
app.include_router(chat.router)
app.include_router(requirements.router)
app.include_router(analyze_repo.router)
