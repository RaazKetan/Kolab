#!/usr/bin/env python3
"""
Quick test script to verify the repository analysis endpoint works
"""
import requests
import json

# Test the analyze endpoint
repo_url = "https://github.com/fastapi/fastapi"
print(f"Testing repository analysis for: {repo_url}")

try:
    response = requests.post(
        "http://localhost:8000/analyze-repo/user-repo",
        json={"repo_url": repo_url},
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"\nResponse:")
    print(json.dumps(response.json(), indent=2))
    
except Exception as e:
    print(f"Error: {e}")
