# Conekt - Google Cloud Run Deployment Guide

This guide will walk you through deploying both the frontend and backend of Conekt to Google Cloud Run.

## Prerequisites

1. **Google Cloud Platform Account**
   - Create an account at [cloud.google.com](https://cloud.google.com)
   - Create a new project or select an existing one

2. **Install Google Cloud SDK**
   ```bash
   # macOS (using Homebrew)
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

3. **Install Docker**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop)

4. **Authenticate with Google Cloud**
   ```bash
   gcloud auth login
   gcloud auth configure-docker
   ```

## Setup Steps

### 1. Enable Required APIs

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com
```

### 2. Set Up Cloud SQL (Recommended for Production)

For production, use Cloud SQL PostgreSQL instead of SQLite:

```bash
# Create a PostgreSQL instance
gcloud sql instances create conekt-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1

# Set root password
gcloud sql users set-password postgres \
    --instance=conekt-db \
    --password=YOUR_SECURE_PASSWORD

# Create database
gcloud sql databases create origin --instance=conekt-db

# Get connection name
gcloud sql instances describe conekt-db --format='value(connectionName)'
# Save this - you'll need it for DATABASE_URL
```

Your DATABASE_URL will be:
```
postgresql://postgres:YOUR_PASSWORD@/origin?host=/cloudsql/CONNECTION_NAME
```

**Note:** You'll need to add `--add-cloudsql-instances=CONNECTION_NAME` to your Cloud Run deployment.

### 3. Prepare Environment Variables

Create a file called `.env.deploy` (this file is gitignored):

```bash
# Backend Environment Variables
export GEMINI_API_KEY="your-gemini-api-key"
export SECRET_KEY="$(openssl rand -base64 32)"
export DATABASE_URL="postgresql://postgres:password@/origin?host=/cloudsql/PROJECT:REGION:INSTANCE"

# GCP Settings
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
```

Load the variables:
```bash
source .env.deploy
```

## Deployment Options

### Option 1: Quick Deployment (Recommended)

Use the provided deployment script:

```bash
./deploy.sh
```

This script will:
1. Check prerequisites
2. Prompt for configuration
3. Build and push Docker images
4. Deploy both frontend and backend
5. Display the URLs

### Option 2: Using Cloud Build

For automated CI/CD, use Cloud Build:

```bash
./deploy-cloudbuild.sh
```

Or manually:

```bash
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_REGION=$GCP_REGION,_DATABASE_URL=$DATABASE_URL,_GEMINI_API_KEY=$GEMINI_API_KEY,_SECRET_KEY=$SECRET_KEY
```

### Option 3: Manual Deployment

#### Deploy Backend

```bash
# Build and push backend
cd backend
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-backend:latest .
docker push gcr.io/$GCP_PROJECT_ID/conekt-backend:latest

# Deploy to Cloud Run
gcloud run deploy conekt-backend \
    --image gcr.io/$GCP_PROJECT_ID/conekt-backend:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-env-vars "DATABASE_URL=$DATABASE_URL,GEMINI_API_KEY=$GEMINI_API_KEY,SECRET_KEY=$SECRET_KEY,ALGORITHM=HS256,ACCESS_TOKEN_EXPIRE_MINUTES=30" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10

# If using Cloud SQL, add this flag:
# --add-cloudsql-instances=PROJECT:REGION:INSTANCE
```

#### Deploy Frontend

```bash
# Get backend URL
export BACKEND_URL=$(gcloud run services describe conekt-backend --region $GCP_REGION --format 'value(status.url)')

# Create production env file
cat > frontend/.env.production << EOF
VITE_API_BASE_URL=$BACKEND_URL
VITE_APP_NAME=Conekt
VITE_NODE_ENV=production
EOF

# Build and push frontend
cd frontend
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest .
docker push gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest

# Deploy to Cloud Run
gcloud run deploy conekt-frontend \
    --image gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10
```

## Post-Deployment Configuration

### 1. Update CORS Settings

After deployment, update the CORS origins in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-url.run.app",  # Add your frontend URL
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy the backend after making changes.

### 2. Set Up Custom Domain (Optional)

```bash
# Map domain to service
gcloud run domain-mappings create \
    --service conekt-frontend \
    --domain your-domain.com \
    --region $GCP_REGION
```

Follow the instructions to configure DNS records.

### 3. Configure Secrets (Best Practice)

Instead of environment variables, use Secret Manager:

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
echo -n "$SECRET_KEY" | gcloud secrets create jwt-secret-key --data-file=-

# Deploy with secrets
gcloud run deploy conekt-backend \
    --image gcr.io/$GCP_PROJECT_ID/conekt-backend:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest,SECRET_KEY=jwt-secret-key:latest" \
    --set-env-vars="DATABASE_URL=$DATABASE_URL,ALGORITHM=HS256,ACCESS_TOKEN_EXPIRE_MINUTES=30"
```

## Monitoring and Logs

### View Logs

```bash
# Backend logs
gcloud run services logs read conekt-backend --region $GCP_REGION --limit 50

# Frontend logs
gcloud run services logs read conekt-frontend --region $GCP_REGION --limit 50

# Follow logs in real-time
gcloud run services logs tail conekt-backend --region $GCP_REGION
```

### Monitor Performance

1. Visit [Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Run
3. Select your service
4. View metrics: requests, latency, container instances

## Updating Your Deployment

To update your services:

```bash
# Make your code changes, then run
./deploy.sh
```

Or manually rebuild and redeploy:

```bash
# Backend
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-backend:latest ./backend
docker push gcr.io/$GCP_PROJECT_ID/conekt-backend:latest
gcloud run deploy conekt-backend --image gcr.io/$GCP_PROJECT_ID/conekt-backend:latest --region $GCP_REGION

# Frontend
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest ./frontend
docker push gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest
gcloud run deploy conekt-frontend --image gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest --region $GCP_REGION
```

## Scaling Configuration

Cloud Run auto-scales based on traffic. Adjust settings:

```bash
gcloud run services update conekt-backend \
    --region $GCP_REGION \
    --min-instances 1 \          # Keep warm
    --max-instances 100 \        # Scale limit
    --cpu 2 \                    # CPU allocation
    --memory 1Gi \               # Memory allocation
    --concurrency 80             # Requests per container
```

## Cost Optimization

1. **Use minimum instances = 0** for development (cold starts are okay)
2. **Set memory to minimum required** (256Mi for frontend, 512Mi for backend)
3. **Use Cloud SQL Proxy** instead of public IP
4. **Enable request/response compression** in nginx (already configured)
5. **Monitor usage** via Cloud Console billing

## Troubleshooting

### Container fails to start

```bash
# Check logs
gcloud run services logs read conekt-backend --region $GCP_REGION --limit 100

# Common issues:
# - Port mismatch (ensure container listens on $PORT)
# - Missing environment variables
# - Database connection issues
```

### Database connection errors

```bash
# Test database connectivity
gcloud sql connect conekt-db --user=postgres

# Verify connection string format
# For Cloud SQL: postgresql://user:pass@/dbname?host=/cloudsql/CONNECTION_NAME
```

### CORS errors

- Update `backend/app/main.py` with your frontend URL
- Redeploy backend
- Clear browser cache

### Build fails

```bash
# Test build locally
docker build -t test-backend ./backend
docker build -t test-frontend ./frontend

# Run locally to test
docker run -p 8080:8080 -e PORT=8080 test-backend
docker run -p 8080:8080 test-frontend
```

## Security Best Practices

1. **Use Cloud SQL with private IP** (no public access)
2. **Store secrets in Secret Manager** (not environment variables)
3. **Enable Identity-Aware Proxy (IAP)** for admin endpoints
4. **Set up VPC Connector** for backend-database communication
5. **Use Cloud Armor** for DDoS protection
6. **Enable Cloud Audit Logs** for compliance
7. **Regularly update dependencies** and base images

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy
        run: |
          gcloud builds submit --config=cloudbuild.yaml \
            --substitutions=_REGION=us-central1,_DATABASE_URL=${{ secrets.DATABASE_URL }},_GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }},_SECRET_KEY=${{ secrets.SECRET_KEY }}
```

## Support and Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Best Practices for Cloud Run](https://cloud.google.com/run/docs/best-practices)

## Cost Estimates

Approximate monthly costs (as of 2025):

- **Backend (512MB, avg 100k requests/month):** ~$5-10
- **Frontend (256MB, avg 500k requests/month):** ~$3-5
- **Cloud SQL (db-f1-micro):** ~$7-10
- **Container Registry Storage:** ~$1-2
- **Total:** ~$16-27/month

Free tier includes:
- 2 million requests/month
- 360,000 GB-seconds/month
- 180,000 vCPU-seconds/month

---

**Happy Deploying! 🚀**

