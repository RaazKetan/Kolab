# Vercel Deployment Guide

This guide walks you through deploying Origin to Vercel with separate deployments for the backend (FastAPI) and frontend (React).

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier works)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- GitHub account (for connecting repositories)
- PostgreSQL database (see Database Setup below)

## Database Setup

Vercel's serverless environment doesn't support SQLite. You need a PostgreSQL database. Here are recommended options:

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Follow the setup wizard
4. Copy the `DATABASE_URL` connection string

### Option 2: Supabase (Free Tier Available)

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for better performance)

### Option 3: Neon (Serverless Postgres)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard

## Backend Deployment

### Step 1: Prepare Your Repository

Ensure your backend code is in a Git repository (GitHub, GitLab, or Bitbucket).

```bash
cd /path/to/Conekt/backend
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set the **Root Directory** to `backend`
4. Configure environment variables (see below)
5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `origin-backend` (or your choice)
- In which directory is your code located? `./`

### Step 3: Configure Environment Variables

In your Vercel project settings (Settings → Environment Variables), add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:password@host:5432/dbname` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Your Gemini API key | Google Gemini API key |
| `GOOGLE_API_KEY` | Your Google API key | Google API key for ADK |
| `SECRET_KEY` | Random secure string | JWT secret (generate with `openssl rand -hex 32`) |

After adding variables, redeploy:
```bash
vercel --prod
```

### Step 4: Note Your Backend URL

After deployment, Vercel will provide a URL like:
```
https://origin-backend.vercel.app
```

**Save this URL** - you'll need it for frontend configuration.

## Frontend Deployment

### Step 1: Configure API URL

Create a `.env` file in the frontend directory:

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env` and set your backend URL:
```env
VITE_API_URL=https://collabfoundry-backend.vercel.app
```

### Step 2: Update API Calls (if needed)

Ensure your frontend uses the environment variable for API calls. Check `src/` files and update any hardcoded `localhost:8000` references:

```javascript
// Use this pattern:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Example:
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  // ...
});
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set the **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = Your backend URL
5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
cd frontend
vercel
```

Follow the prompts similar to backend deployment.

### Step 4: Update CORS Settings

Update your backend's CORS configuration to allow your frontend URL.

Edit `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://your-frontend.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy the backend after this change.

## Database Migration

If you have existing data in SQLite, you'll need to migrate to PostgreSQL:

### Step 1: Export SQLite Data

```bash
# Install sqlite3 if not available
sqlite3 origin.db .dump > dump.sql
```

### Step 2: Clean and Import to PostgreSQL

```bash
# Clean the dump file (remove SQLite-specific commands)
sed -i '' '/BEGIN TRANSACTION;/d' dump.sql
sed -i '' '/COMMIT;/d' dump.sql

# Import to PostgreSQL
psql $DATABASE_URL < dump.sql
```

Alternatively, use a migration tool like [pgloader](https://pgloader.io/).

## Verification

### Test Backend

```bash
curl https://your-backend.vercel.app/docs
```

You should see the FastAPI documentation page.

### Test Frontend

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Try registering a new account
3. Test login functionality
4. Create a project
5. Test matching features

## Troubleshooting

### Backend Issues

**Error: "Module not found"**
- Ensure all dependencies are in `requirements.txt`
- Check that `api/index.py` correctly imports from `app.main`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correctly set in environment variables
- Check database is accessible from Vercel (most cloud databases allow this by default)
- Ensure connection string includes SSL mode: `?sslmode=require`

**Error: "Function timeout"**
- Vercel free tier has 10s timeout for serverless functions
- Optimize slow database queries
- Consider upgrading to Pro plan for 60s timeout

### Frontend Issues

**Error: "Failed to fetch"**
- Check CORS settings in backend
- Verify `VITE_API_URL` is correctly set
- Check browser console for specific error messages

**Blank page after deployment**
- Check browser console for errors
- Verify build completed successfully in Vercel logs
- Ensure `vercel.json` rewrites are configured for SPA routing

### General Tips

- Check Vercel deployment logs for detailed error messages
- Use `vercel logs` command to view runtime logs
- Test environment variables with `vercel env pull`
- Use Vercel's preview deployments for testing before production

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To customize:

1. Go to Project Settings → Git
2. Configure production branch
3. Set up preview deployments for pull requests

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update CORS settings with new domain

## Cost Considerations

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution
- Automatic HTTPS

**Paid Features:**
- Increased bandwidth
- Longer function timeout (60s)
- Team collaboration
- Advanced analytics

## Next Steps

- Set up monitoring with Vercel Analytics
- Configure custom domain
- Set up staging environment (separate Vercel project)
- Implement CI/CD with GitHub Actions for additional testing

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [FastAPI on Vercel Guide](https://vercel.com/guides/using-fastapi-with-vercel)
