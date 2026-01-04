# Cloud SQL Setup Guide

This guide walks you through setting up Cloud SQL PostgreSQL for Origin.

## Prerequisites

- Google Cloud Project with billing enabled
- `gcloud` CLI installed and configured
- Project ID ready

## Step 1: Create Cloud SQL Instance

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create PostgreSQL instance (db-f1-micro for development, ~$7-10/month)
gcloud sql instances create origin-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password="CHANGE_THIS_STRONG_PASSWORD"

# Wait for instance to be created (takes 3-5 minutes)
gcloud sql instances list
```

## Step 2: Create Database and User

```bash
# Create the database
gcloud sql databases create origin \
  --instance=origin-db

# Create application user
gcloud sql users create origin_user \
  --instance=origin-db \
  --password="CHANGE_THIS_USER_PASSWORD"
```

## Step 3: Get Connection Name

```bash
# Get the connection name (format: project:region:instance)
gcloud sql instances describe origin-db \
  --format="value(connectionName)"

# Example output: your-project:us-central1:origin-db
# Save this for deployment configuration
```

## Step 4: Configure Secrets (Recommended)

Store sensitive data in Secret Manager:

```bash
# Create secret for database password
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password \
  --data-file=- \
  --replication-policy=automatic

# Create secret for Gemini API key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy=automatic

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 5: Test Local Connection (Optional)

Install Cloud SQL Proxy for local testing:

```bash
# Download Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy

# Start proxy
./cloud-sql-proxy your-project:us-central1:origin-db

# In another terminal, test connection
psql "host=127.0.0.1 port=5432 dbname=origin user=origin_user"
```

## Step 6: Update Deployment Configuration

### Option A: Using Substitution Variables (Simple)

Update `cloudbuild.yaml` substitutions:

```yaml
substitutions:
  _CLOUD_SQL_CONNECTION_NAME: 'your-project:us-central1:origin-db'
  _DB_USER: 'origin_user'
  _DB_NAME: 'origin'
  _GEMINI_API_KEY: 'your-gemini-api-key'
  _GOOGLE_API_KEY: 'your-google-api-key'
  _SECRET_KEY: 'your-jwt-secret-key'
```

### Option B: Using Secret Manager (Recommended)

Uncomment the secrets section in `cloudbuild.yaml`:

```yaml
- '--set-secrets'
- 'DB_PASSWORD=db-password:latest,GEMINI_API_KEY=gemini-api-key:latest'
```

And update environment variables to reference secrets:

```yaml
- '--set-env-vars'
- 'DATABASE_TYPE=postgresql,CLOUD_SQL_CONNECTION_NAME=${_CLOUD_SQL_CONNECTION_NAME},DB_USER=${_DB_USER},DB_NAME=${_DB_NAME}'
```

## Step 7: Deploy to Cloud Run

```bash
# Deploy using Cloud Build
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_CLOUD_SQL_CONNECTION_NAME="your-project:us-central1:origin-db",_DB_USER="origin_user",_DB_NAME="origin",_GEMINI_API_KEY="your-key",_GOOGLE_API_KEY="your-key",_SECRET_KEY="your-secret"
```

Or use the deploy script:

```bash
./deploy.sh
```

## Step 8: Verify Deployment

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe conekt-backend \
  --region=us-central1 \
  --format="value(status.url)")

# Test health endpoint
curl $BACKEND_URL/

# Check logs
gcloud run services logs read conekt-backend --region=us-central1
```

Look for: `Using PostgreSQL (Cloud SQL) database` in the logs.

## Troubleshooting

### Connection Errors

```bash
# Check Cloud SQL instance status
gcloud sql instances describe origin-db

# Check Cloud Run service configuration
gcloud run services describe conekt-backend --region=us-central1

# View detailed logs
gcloud run services logs read conekt-backend --region=us-central1 --limit=50
```

### Common Issues

1. **"Failed to connect to Cloud SQL"**
   - Verify `CLOUD_SQL_CONNECTION_NAME` is correct
   - Ensure Cloud Run has `--add-cloudsql-instances` configured
   - Check that database user and password are correct

2. **"Database does not exist"**
   - Verify database was created: `gcloud sql databases list --instance=origin-db`
   - Check `DB_NAME` environment variable

3. **"Permission denied"**
   - Verify user exists: `gcloud sql users list --instance=origin-db`
   - Check password is correct
   - Ensure user has permissions on database

## Cost Optimization

- **db-f1-micro**: ~$7-10/month (0.6GB RAM, shared CPU)
- **db-g1-small**: ~$25/month (1.7GB RAM, shared CPU)
- **Storage**: $0.17/GB/month

### Tips:
- Start with db-f1-micro
- Enable automated backups (adds ~$0.08/GB/month)
- Set maintenance window during low-traffic hours
- Monitor query performance with Cloud SQL Insights

## Backup and Recovery

```bash
# Create on-demand backup
gcloud sql backups create --instance=origin-db

# List backups
gcloud sql backups list --instance=origin-db

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=origin-db \
  --backup-id=BACKUP_ID
```

## Monitoring

Set up alerts in Cloud Console:
- CPU utilization > 80%
- Memory utilization > 80%
- Connection count > 80% of max
- Disk utilization > 80%

## Next Steps

1. ✅ Cloud SQL instance created
2. ✅ Database and user configured
3. ✅ Secrets stored in Secret Manager
4. ✅ Cloud Run deployed with Cloud SQL connection
5. 🔄 Monitor performance and optimize as needed
6. 🔄 Set up automated backups
7. 🔄 Configure alerts

## Resources

- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
