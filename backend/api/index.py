"""
Vercel serverless function entry point for FastAPI backend.
This file exports the FastAPI app as an ASGI application for Vercel.
"""
from app.main import app

# Export the FastAPI app for Vercel
# Vercel will use this as the ASGI application
handler = app
