#!/usr/bin/env python3
"""
Startup script for CollabFoundry frontend
"""
import subprocess
import sys
from pathlib import Path

def main():
    print("🎨 Starting CollabFoundry Frontend...")
    
    # Change to frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    
    # Start the development server
    subprocess.run([
        sys.executable, "-m", "vite", 
        "--host", "0.0.0.0", 
        "--port", "5173"
    ], cwd=frontend_dir)

if __name__ == "__main__":
    main()
