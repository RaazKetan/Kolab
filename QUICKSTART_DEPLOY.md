# Quick Start - Deploy to Cloud Run in 5 Minutes

This is a streamlined guide to get Conekt running on Google Cloud Run quickly.

## Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed ([download](https://cloud.google.com/sdk/docs/install))
3. Docker installed ([download](https://www.docker.com/products/docker-desktop))

## Steps

### 1. Authenticate

```bash
gcloud auth login
gcloud auth configure-docker
```

### 2. Set Your Project

```bash
export GCP_PROJECT_ID="your-gcp-project-id"
gcloud config set project $GCP_PROJECT_ID
```

### 3. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy it for the next step

### 4. Run the Deployment Script

```bash
./deploy.sh
```

The script will prompt you for:
- GCP Project ID (if not already set)
- GCP Region (default: us-central1)
- Gemini API Key
- JWT Secret Key (auto-generated if you press enter)
- Database URL (press enter for SQLite - **not for production**)

### 5. Done! 🎉

The script will output your URLs:
- **Frontend:** `https://conekt-frontend-XXXXX.run.app`
- **Backend:** `https://conekt-backend-XXXXX.run.app`

## Important: Update CORS

After deployment, update the CORS settings in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://conekt-frontend-XXXXX.run.app",  # Your frontend URL
    ],
    ...
)
```

Then redeploy:

```bash
cd backend
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-backend:latest .
docker push gcr.io/$GCP_PROJECT_ID/conekt-backend:latest
gcloud run deploy conekt-backend \
    --image gcr.io/$GCP_PROJECT_ID/conekt-backend:latest \
    --region us-central1
```

## Production Recommendations

For production use, consider:

1. **Use PostgreSQL instead of SQLite**
   - Set up Cloud SQL (see full DEPLOYMENT.md guide)
   
2. **Use Secret Manager**
   - Store sensitive keys securely
   
3. **Set up monitoring**
   - Enable Cloud Logging and Monitoring
   
4. **Configure custom domain**
   - Add your own domain name

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

**Build fails?**
```bash
# Test locally first
docker build -t test ./backend
docker build -t test ./frontend
```

**CORS errors?**
- Make sure to update `allow_origins` in `backend/app/main.py`
- Redeploy backend after changes

**Database errors?**
- For production, use Cloud SQL PostgreSQL
- SQLite won't persist data on Cloud Run

**Need help?**
- Check logs: `gcloud run services logs read conekt-backend --region us-central1`
- See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

