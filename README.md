# CollabFoundry - Tinder for Projects

A platform that connects students and professionals who want to collaborate on real projects, featuring a Tinder-like matching interface.

## Features

- 🔐 User authentication (login/register)
- 🎯 Tinder-like project discovery with swipe functionality
- 🤝 AI-powered project matching based on skills
- 📱 Responsive design for mobile and desktop
- 🚀 FastAPI backend with SQLite database
- ⚡ Real-time project recommendations

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend)

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export DATABASE_URL="sqlite:///./collabfoundry.db"
export GEMINI_API_KEY="your-gemini-api-key"
```

3. Start the backend:
```bash
python ../start_backend.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend:
```bash
python ../start_frontend.py
```

The app will be available at `http://localhost:5173`

## Demo Credentials

The system comes pre-populated with dummy users:

- **Alex Johnson**: alex@example.com / password123
- **Sarah Chen**: sarah@example.com / password123
- **Mike Rodriguez**: mike@example.com / password123
- **Emma Wilson**: emma@example.com / password123
- **David Kim**: david@example.com / password123

## How to Use

1. **Register/Login**: Create a new account or use demo credentials
2. **Discover Projects**: Swipe through projects like Tinder
   - ❌ **Pass**: Skip projects you're not interested in
   - ❤️ **Like**: Save projects you want to collaborate on
3. **View Matches**: See all projects you've liked
4. **Get Recommendations**: AI-powered suggestions based on your skills

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Projects
- `GET /projects/` - List all projects
- `GET /projects/{id}` - Get specific project
- `POST /projects/` - Create new project

### Matching
- `GET /matching/discover` - Get next project to discover
- `POST /matching/swipe` - Swipe on a project (like/pass)
- `GET /matching/matches` - Get user's liked projects
- `GET /matching/recommendations` - Get AI recommendations

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features

## Project Structure

```
Conekt/
├── backend/
│   ├── app/
│   │   ├── routers/     # API route handlers
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── auth.py      # Authentication logic
│   │   └── main.py      # FastAPI app
│   ├── requirements.txt
│   └── seed_data.py     # Dummy data seeder
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   └── App.css      # Styles
│   └── package.json
├── start_backend.py     # Backend startup script
├── start_frontend.py    # Frontend startup script
└── README.md
```

## Development

### Adding New Features

1. **Backend**: Add new routes in `backend/app/routers/`
2. **Frontend**: Update `frontend/src/App.jsx` for new UI components
3. **Database**: Modify models in `backend/app/models.py`

### Database Seeding

The system automatically seeds with dummy data on startup. To re-seed:

```python
from backend.app.seed_data import seed_database
seed_database()
```

## Deployment

### Deploy to Google Cloud Run

Quick deployment (5 minutes):

```bash
./deploy.sh
```

For detailed deployment instructions, see:
- **Quick Start:** [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)
- **Full Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

The deployment includes:
- ✅ Backend API on Cloud Run
- ✅ Frontend on Cloud Run with Nginx
- ✅ Automated Docker builds
- ✅ Environment configuration
- ✅ HTTPS enabled by default

### Deployment Files

- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration
- `cloudbuild.yaml` - Cloud Build configuration
- `deploy.sh` - Interactive deployment script
- `deploy-cloudbuild.sh` - Cloud Build deployment script

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
