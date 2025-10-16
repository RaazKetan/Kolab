#!/usr/bin/env python3
"""
Startup script for CollabFoundry backend
"""
import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Set environment variables
os.environ.setdefault("DATABASE_URL", "sqlite:///./collabfoundry.db")
os.environ.setdefault("GEMINI_API_KEY", "demo-key")

def main():
    print("🚀 Starting CollabFoundry Backend...")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Import and run the seeder
    try:
        from app.seed_data import seed_database
        print("📊 Seeding database with dummy data...")
        seed_database()
        print("✅ Database seeded successfully!")
    except Exception as e:
        print(f"⚠️  Database seeding failed: {e}")
        print("Continuing without seeding...")
    
    # Start the server
    print("🌐 Starting FastAPI server...")
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "app.main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ])

if __name__ == "__main__":
    main()
