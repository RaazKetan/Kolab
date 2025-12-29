"""
Cloud SQL connection helper for production deployments
"""
import os
from sqlalchemy import create_engine
from google.cloud.sql.connector import Connector
import sqlalchemy


def get_cloud_sql_engine():
    """
    Create SQLAlchemy engine for Cloud SQL PostgreSQL
    
    Uses Cloud SQL Python Connector for secure connections via Unix socket
    """
    connector = Connector()
    
    def getconn():
        """Create database connection using Cloud SQL connector"""
        conn = connector.connect(
            os.getenv("CLOUD_SQL_CONNECTION_NAME"),
            "pg8000",
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            db=os.getenv("DB_NAME", "collabfoundry")
        )
        return conn
    
    # Create engine with connection pooling
    engine = sqlalchemy.create_engine(
        "postgresql+pg8000://",
        creator=getconn,
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,  # Recycle connections after 30 minutes
    )
    
    return engine
