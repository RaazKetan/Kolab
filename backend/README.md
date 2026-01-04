# Origin Backend

This directory contains the FastAPI backend for the Origin application. It handles user authentication, project management, profile analysis, and integration with Generative AI agents.

## Directory Structure

### Core Application (`/app`)

- **`main.py`**: The entry point of the application. Configures the FastAPI app, middleware (CORS), and registers all routers.
- **`auth.py`**: Handles JWT authentication logic, password hashing, and token generation.
- **`database.py`**: Sets up the database connection using SQLAlchemy and manages database sessions.
- **`models.py`**: Defines the database schema using SQLAlchemy ORM (User, Project, Swipe, ChatMessage models).
- **`schemas.py`**: Defines Pydantic models for request and response validation/serialization.
- **`crud.py`**: Contains reusable Create, Read, Update, Delete operations for database interaction.
- **`gemini_agent.py`**: The core interface for interacting with Google's Gemini models and ADK agents. Handles prompts for repo analysis, requirements gathering, and chat monitoring.
- **`seed_data.py`**: A utility script to populate the database with initial test data (users, projects, etc.).
- **`match_utlis.py`**: Utility functions for matching, likely for vector similarity calculations.

### API Routers (`/app/routers`)

- **`auth.py`**: Endpoints for user registration (`/signup`) and login (`/token`).
- **`users.py`**: User management endpoints (`GET /users`, `GET /users/{id}`, `PUT /users/{id}`). Also handles adding/removing repositories from user profiles.
- **`projects.py`**: Endpoints for creating, listing, and updating projects.
- **`repo_projects.py`**: Specialized endpoint to create a project directly from a GitHub repository URL.
- **`analyze_repo.py`**: Endpoint (`/analyze-repo/user-repo`) to analyze a single GitHub repository using the ADK agent for user profiles.
- **`profile.py`**: Endpoints for setting up and viewing user profiles.
- **`matching.py`**: Logic for matching users with projects (swiping, recommendations).
- **`chat.py`**: Endpoints for messaging between users.
- **`requirements.py`**: Handles the AI-driven project requirements gathering workflow (`/requirements/process`, `/requirements/template`).
- **`ai.py`**: General AI interaction endpoints.

### AI Agents (`/app/agents`)

- **`github.py`**: Configuration for the GitHub ADK agent, including tool definitions for analyzing repositories.

## Key Features

- **GitHub Integration**: Analyzes repositories to extract skills, languages, and contribution metrics using the GitHub ADK agent.
- **AI Matching**: Matches users to projects based on skills and interests using vector embeddings.
- **Project Requirements**: Uses AI to interview users and generate project templates.
- **Chat System**: Integrated messaging for matched users.
- **Swipe Interface**: Tinder-like interface for discovering projects.

## Setup

### Local Development

1. Ensure Python 3.9+ is installed.
2. Install dependencies: `pip install -r requirements.txt`
3. Set environment variables (GEMINI_API_KEY, GOOGLE_API_KEY, DATABASE_URL, SECRET_KEY).
4. Run the server: `uvicorn app.main:app --reload`

### Vercel Deployment

The backend is configured for Vercel serverless deployment:

1. **Database**: Use PostgreSQL (Vercel Postgres, Supabase, or Neon) - SQLite won't work on serverless
2. **Entry Point**: `api/index.py` exports the FastAPI app for Vercel
3. **Configuration**: `vercel.json` defines build and routing settings

**Deploy:**
```bash
cd backend
vercel
```

**Important Considerations:**
- Serverless functions have execution time limits (10s free tier, 60s pro)
- Database connections should use connection pooling
- File system is read-only except `/tmp`
- Environment variables must be set in Vercel dashboard

See [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) for complete instructions.
