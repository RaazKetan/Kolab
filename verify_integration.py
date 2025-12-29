import sys
import os

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), "backend"))

import asyncio

async def verify():
    try:
        from app.gemini_agent import analyze_repo_url
        print("Successfully imported analyze_repo_url")
        
        # Test with a dummy URL
        print("Testing analyze_repo_url with dummy data...")
        result = await analyze_repo_url(
            "https://github.com/RaazKetan/voxa", 
            readme_text="# Voxa", 
            files=[{"path": "requirements.txt", "content": "fastapi"}]
        )
        
        print("\nResult:")
        print(result.get("project_title"))
        print(result.get("repo_url"))
        
        if "project_title" in result:
            print("Verification SUCCESS: keys present")
        else:
            print("Verification FAILED: keys missing")

    except ImportError as e:
        print(f"ImportError: {e}")
        print("Make sure you are running from the project root")
    except Exception as e:
        print(f"Runtime Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify())
