# Origin - AI-Powered Talent & Project Collaboration Platform

A comprehensive platform for connecting professionals and organizations through intelligent project matching, AI-powered talent sourcing, and skill gap analysis.

## Overview

Origin is an enterprise-grade collaboration platform that leverages artificial intelligence to facilitate meaningful connections between talent and opportunities. The platform features intelligent matching algorithms, natural language search capabilities, and automated skill assessment tools.

## Core Features

### Project Discovery & Matching
- **Intelligent Project Discovery** - AI-powered recommendation engine
- **Smart Matching Algorithm** - Skills-based project recommendations
- **Interactive Review System** - Streamlined project evaluation workflow
- **Real-time Notifications** - Stay updated on matches and messages

### AI-Powered Talent Sourcing
- **Natural Language Search** - Find candidates using conversational queries
- **Semantic Matching** - Vector-based similarity search for precise results
- **Candidate Ranking** - AI-generated match scores (0-100%)
- **Comprehensive Profiles** - Detailed candidate information with work history

### Skill Gap Analysis & Learning Recommendations
- **Interview Transcript Analysis** - AI-powered skill assessment
- **Gap Identification** - Prioritized skill gaps with impact analysis
- **Personalized Learning Roadmaps** - Phase-based learning plans with timelines
- **Course Recommendations** - Curated resources from multiple platforms
- **Readiness Scoring** - Quantifiable deployment readiness metrics

### GitHub Integration
- **Repository Analysis** - Automated skill extraction from GitHub repositories
- **Profile Enhancement** - Merge detected skills with existing profiles
- **Technology Detection** - Identify languages, frameworks, and tools

### Communication & Collaboration
- **Real-time Messaging** - Project-based chat system
- **Notification System** - Stay informed of important updates
- **Profile Management** - Comprehensive user profiles with skills and experience

## Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Advanced ORM with relationship management
- **SQLite** - Embedded database for development
- **Google Gemini AI** - Advanced language model for analysis
- **JWT Authentication** - Secure token-based authentication
- **Pydantic** - Data validation and serialization

### Frontend
- **React** - Component-based UI library
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Modern JavaScript** - ES6+ features

## Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Google Gemini API key

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Conekt
```

#### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```bash
DATABASE_URL=sqlite:///./origin.db
GEMINI_API_KEY=your_api_key_here
GOOGLE_API_KEY=your_api_key_here
```

Start the backend server:
```bash
python ../start_backend.py
```

API available at: `http://localhost:8000`

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Application available at: `http://localhost:5173`

### Initial Data Seeding

The system includes pre-populated demo data. To seed the talent database:

```javascript
// In browser console after logging in:
fetch('http://localhost:8000/talent/seed', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

## API Documentation

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Retrieve current user profile

### Project Management
- `GET /projects/` - List all projects
- `GET /projects/{id}` - Retrieve specific project
- `POST /projects/` - Create new project
- `PUT /projects/{id}` - Update project details

### Matching & Discovery
- `GET /matching/discover` - Get next recommended project
- `POST /matching/swipe` - Evaluate project (like/pass)
- `GET /matching/matches` - Retrieve user's liked projects
- `GET /matching/recommendations` - Get AI-powered recommendations

### Talent Sourcing
- `POST /talent/search` - Search candidates with natural language
- `POST /talent/seed` - Initialize candidate database
- `GET /talent/candidate/{id}` - Retrieve candidate details

### Skill Gap Analysis
- `POST /skill-gap/analyze` - Analyze interview and generate roadmap
- `GET /skill-gap/candidate/{candidate_id}` - Get candidate's analyses
- `GET /skill-gap/analysis/{analysis_id}` - Retrieve specific analysis

### GitHub Integration
- `POST /analyze-repo/user-repo` - Analyze GitHub repository
- `POST /users/{user_id}/repositories` - Add repository to profile
- `DELETE /users/{user_id}/repositories/{index}` - Remove repository

### User Management
- `GET /users/` - List all users
- `GET /users/{id}` - Retrieve user profile
- `PUT /users/{id}` - Update user profile

## Usage Guide

### For Hiring Teams

#### Finding Talent
1. Navigate to "Search Talent"
2. Enter natural language query describing ideal candidate
3. Review ranked results with match scores
4. Click "Analyze Skills" for detailed assessment

#### Conducting Skill Gap Analysis
1. Select a candidate from search results
2. Click "📊 Analyze Skills"
3. Enter target role and paste interview transcript
4. Review comprehensive analysis including:
   - Readiness score
   - Identified strengths
   - Skill gaps with priorities
   - Personalized learning roadmap
   - Course recommendations

### For Candidates

#### Building Your Profile
1. Complete profile with skills and experience
2. Add GitHub repositories for automatic skill detection
3. Review and confirm detected technologies
4. Skills are merged with existing profile data

#### Discovering Projects
1. Browse recommended projects
2. Review project details and requirements
3. Like projects of interest
4. View matches and initiate conversations

## Project Structure

```
Conekt/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py              # Authentication
│   │   │   ├── users.py             # User management
│   │   │   ├── projects.py          # Project CRUD
│   │   │   ├── matching.py          # Matching algorithm
│   │   │   ├── talent.py            # Talent search
│   │   │   ├── skill_gap.py         # Skill gap analysis
│   │   │   ├── analyze_repo.py      # GitHub integration
│   │   │   ├── chat.py              # Messaging
│   │   │   └── requirements.py      # Requirements matching
│   │   ├── models.py                # Database models
│   │   ├── schemas.py               # Pydantic schemas
│   │   ├── auth.py                  # Auth utilities
│   │   ├── gemini_agent.py          # AI integration
│   │   └── main.py                  # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TalentSearch.jsx     # Talent search UI
│   │   │   ├── SkillGapAnalysis.jsx # Analysis modal
│   │   │   ├── ProfileView.jsx      # User profile
│   │   │   └── ...
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # Entry point
│   └── package.json
└── README.md
```

## Development

### Adding New Features

#### Backend
1. Create new router in `backend/app/routers/`
2. Define database models in `models.py`
3. Create Pydantic schemas in `schemas.py`
4. Register router in `main.py`

#### Frontend
1. Create component in `frontend/src/components/`
2. Add routing logic in `App.jsx`
3. Update navigation in `Navigation.jsx`

### Database Migrations

The system uses SQLAlchemy with automatic table creation. Models are defined in `models.py` and tables are created on startup.

## Deployment

### Google Cloud Run

Quick deployment:
```bash
./deploy.sh
```

For detailed instructions, see:
- [Quick Start Guide](./QUICKSTART_DEPLOY.md)
- [Full Deployment Guide](./DEPLOYMENT.md)

### Environment Variables

Required environment variables:
- `DATABASE_URL` - Database connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_API_KEY` - Google API key (for ADK)
- `SECRET_KEY` - JWT secret key

## Security

- JWT-based authentication
- Password hashing with secure algorithms
- CORS configuration for API security
- Input validation with Pydantic
- SQL injection prevention via ORM

## Performance

- Vector-based semantic search for fast matching
- Efficient database indexing
- Optimized AI model usage
- Caching strategies for frequently accessed data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API documentation at `/docs` endpoint

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Google Gemini AI for advanced language processing
- FastAPI framework for robust backend architecture
- React community for frontend excellence
