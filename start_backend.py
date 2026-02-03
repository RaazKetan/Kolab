#!/usr/bin/env python3
"""
Startup script for Origin backend
"""
import os
import sys
import subprocess
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()


if __name__ == "__main__":
    # Get the backend directory
    backend_dir = Path(__file__).parent / "backend"
    
    # Add backend to Python path
    sys.path.insert(0, str(backend_dir))

    # Set environment variables
    os.environ.setdefault("DATABASE_URL", "sqlite:///./origin.db")
    os.environ.setdefault("GEMINI_API_KEY", "AIzaSyC3lYBSecqwctQGpyKQWACDIwwNjox-qVM")
    print(os.environ.get("GEMINI_API_KEY"))
def main():
    print("🚀 Starting Origin Backend...")
    
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
