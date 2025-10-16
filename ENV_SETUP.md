# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=sqlite:///./collabfoundry.db

# Gemini AI API Key (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key-here

# JWT Secret Key (change this in production!)
SECRET_KEY=your-super-secret-jwt-key-change-in-production

# JWT Algorithm
ALGORITHM=HS256

# Token Expiration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# App Name
VITE_APP_NAME=CollabFoundry

# Environment
VITE_NODE_ENV=development
```

## How to Get API Keys

### 1. Gemini API Key (Optional)
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Click "Create API Key"
- Copy the key and paste it in your `.env` file

**Note**: The app works without this key, but AI features will be limited.

### 2. Database URL
- **SQLite** (default): `sqlite:///./collabfoundry.db`
- **PostgreSQL**: `postgresql://username:password@localhost/collabfoundry`
- **MySQL**: `mysql://username:password@localhost/collabfoundry`

### 3. JWT Secret Key
Generate a secure random string:
```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32
```

## Quick Setup

1. **Copy the example files:**
```bash
# Backend
cp backend/env.example backend/.env

# Frontend
cp frontend/env.example frontend/.env
```

2. **Edit the `.env` files with your actual values**

3. **Start the application:**
```bash
# Backend
python start_backend.py

# Frontend (in another terminal)
python start_frontend.py
```

## Production Considerations

- Use strong, unique JWT secret keys
- Use environment-specific database URLs
- Set proper CORS origins for your domain
- Use HTTPS in production
- Store sensitive keys in secure secret management systems
