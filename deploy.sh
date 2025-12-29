#!/bin/bash

# Deployment script for Conekt to Google Cloud Run
# Usage: ./deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Conekt Cloud Run Deployment ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Prompt for project ID if not set
if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your GCP Project ID:${NC}"
    read GCP_PROJECT_ID
fi

# Prompt for region
if [ -z "$GCP_REGION" ]; then
    echo -e "${YELLOW}Enter GCP Region (default: us-central1):${NC}"
    read GCP_REGION
    GCP_REGION=${GCP_REGION:-us-central1}
fi

# Set project
echo -e "\n${GREEN}Setting GCP project to: $GCP_PROJECT_ID${NC}"
gcloud config set project $GCP_PROJECT_ID

# Enable required APIs
echo -e "\n${GREEN}Enabling required APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    sqladmin.googleapis.com

# Prompt for environment variables
echo -e "\n${YELLOW}=== Backend Environment Variables ===${NC}"
echo -e "${YELLOW}Enter your Gemini API Key:${NC}"
read -s GEMINI_API_KEY

echo -e "${YELLOW}Enter your JWT Secret Key (or press enter to generate one):${NC}"
read -s SECRET_KEY
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT Secret Key${NC}"
fi

echo -e "${YELLOW}Enter your Database URL (e.g., postgresql://user:pass@host/db):${NC}"
echo -e "${YELLOW}For SQLite, press enter (not recommended for production):${NC}"
read DATABASE_URL
DATABASE_URL=${DATABASE_URL:-sqlite:///./data/collabfoundry.db}

# Build and deploy backend
echo -e "\n${GREEN}Building backend Docker image...${NC}"
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-backend:latest ./backend

echo -e "\n${GREEN}Pushing backend image to GCR...${NC}"
docker push gcr.io/$GCP_PROJECT_ID/conekt-backend:latest

echo -e "\n${GREEN}Deploying backend to Cloud Run...${NC}"
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

# Get backend URL
BACKEND_URL=$(gcloud run services describe conekt-backend --region $GCP_REGION --format 'value(status.url)')
echo -e "\n${GREEN}Backend deployed at: $BACKEND_URL${NC}"

# Update frontend environment variable
echo -e "\n${GREEN}Updating frontend API URL...${NC}"
cat > ./frontend/.env.production << EOF
VITE_API_BASE_URL=$BACKEND_URL
VITE_APP_NAME=Conekt
VITE_NODE_ENV=production
EOF

# Build and deploy frontend
echo -e "\n${GREEN}Building frontend Docker image...${NC}"
docker build -t gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest ./frontend

echo -e "\n${GREEN}Pushing frontend image to GCR...${NC}"
docker push gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest

echo -e "\n${GREEN}Deploying frontend to Cloud Run...${NC}"
gcloud run deploy conekt-frontend \
    --image gcr.io/$GCP_PROJECT_ID/conekt-frontend:latest \
    --platform managed \
    --region $GCP_REGION \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe conekt-frontend --region $GCP_REGION --format 'value(status.url)')

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${GREEN}Backend URL: $BACKEND_URL${NC}"
echo -e "\n${YELLOW}Important: Update CORS settings in backend if needed${NC}"
echo -e "${YELLOW}File: backend/app/main.py${NC}"
echo -e "${YELLOW}Add your frontend URL to allow_origins${NC}\n"

# Clean up temporary files
rm -f ./frontend/.env.production

