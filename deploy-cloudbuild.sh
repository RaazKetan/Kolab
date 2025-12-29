#!/bin/bash

# Deployment script using Cloud Build for Conekt
# Usage: ./deploy-cloudbuild.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Conekt Cloud Build Deployment ===${NC}\n"

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
read DATABASE_URL

# Set project
echo -e "\n${GREEN}Setting GCP project to: $GCP_PROJECT_ID${NC}"
gcloud config set project $GCP_PROJECT_ID

# Submit build to Cloud Build
echo -e "\n${GREEN}Submitting build to Cloud Build...${NC}"
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_REGION=$GCP_REGION,_DATABASE_URL=$DATABASE_URL,_GEMINI_API_KEY=$GEMINI_API_KEY,_SECRET_KEY=$SECRET_KEY

# Get service URLs
BACKEND_URL=$(gcloud run services describe conekt-backend --region $GCP_REGION --format 'value(status.url)' 2>/dev/null || echo "Not deployed yet")
FRONTEND_URL=$(gcloud run services describe conekt-frontend --region $GCP_REGION --format 'value(status.url)' 2>/dev/null || echo "Not deployed yet")

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Frontend URL: $FRONTEND_URL${NC}"
echo -e "${GREEN}Backend URL: $BACKEND_URL${NC}"
echo -e "\n${YELLOW}Important: Update CORS settings in backend if needed${NC}"
echo -e "${YELLOW}File: backend/app/main.py${NC}"
echo -e "${YELLOW}Add your frontend URL to allow_origins${NC}\n"

