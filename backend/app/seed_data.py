from sqlalchemy.orm import Session
from .database import SessionLocal
from . import models, auth

def seed_database():
    db = SessionLocal()
    
    # Clear existing data
    db.query(models.Swipe).delete()
    db.query(models.Project).delete()
    db.query(models.User).delete()
    db.commit()
    
    # Create dummy users
    users_data = [
        {
            "username": "alex_dev",
            "name": "Alex Johnson",
            "email": "alex@example.com",
            "password": "password123",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
            "bio": "Full-stack developer passionate about AI and machine learning",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "rita_research",
            "name": "Rita Singh",
            "email": "rita@example.com",
            "password": "password123",
            "skills": ["TypeScript", "React", "Node.js", "MongoDB"],
            "bio": "Frontend-focused full-stack engineer in EdTech.",
            "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "sarah_ui",
            "name": "Sarah Chen",
            "email": "sarah@example.com",
            "password": "password123",
            "skills": ["React", "TypeScript", "Figma", "CSS"],
            "bio": "UI/UX designer and frontend developer creating beautiful user experiences",
            "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "mike_data",
            "name": "Mike Rodriguez",
            "email": "mike@example.com",
            "password": "password123",
            "skills": ["Python", "Machine Learning", "TensorFlow", "Pandas"],
            "bio": "Data scientist and ML engineer working on AI solutions",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "emma_mobile",
            "name": "Emma Wilson",
            "email": "emma@example.com",
            "password": "password123",
            "skills": ["React Native", "Flutter", "iOS", "Android"],
            "bio": "Mobile app developer building cross-platform applications",
            "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "david_blockchain",
            "name": "David Kim",
            "email": "david@example.com",
            "password": "password123",
            "skills": ["Solidity", "Web3", "Ethereum", "Node.js"],
            "bio": "Blockchain developer and DeFi enthusiast",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
        }
    ]
    
    users = []
    for user_data in users_data:
        hashed_password = auth.get_password_hash(user_data["password"])
        user = models.User(
            username=user_data["username"],
            name=user_data["name"],
            email=user_data["email"],
            password_hash=hashed_password,
            skills=user_data["skills"],
            bio=user_data["bio"],
            avatar_url=user_data["avatar_url"],
            org_type="college",
            org_name="Example University",
            github_profile_url=f"https://github.com/{user_data['username']}",
            github_selected_repos=[{"url": f"https://github.com/{user_data['username']}/demo-repo"}],
            activity_score=70,
            top_languages=user_data["skills"][:2],
            top_frameworks=["React"] if "React" in user_data["skills"] else []
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    
    # Create dummy projects
    projects_data = [
        {
            "title": "AI Study Planner",
            "summary": "An intelligent study planner that uses machine learning to optimize study schedules based on learning patterns and exam dates.",
            "repo_url": "https://github.com/example/ai-study-planner",
            "languages": ["Python", "JavaScript"],
            "frameworks": ["FastAPI", "React", "TensorFlow"],
            "project_type": "Web Application",
            "domains": ["AI", "Education", "Productivity"],
            "skills": ["Python", "FastAPI", "React", "Machine Learning", "PostgreSQL"],
            "complexity": "intermediate",
            "roles": ["Backend Developer", "Frontend Developer", "ML Engineer"],
            "owner_id": users[0].id
        },
        {
            "title": "Campus Events Hub",
            "summary": "A portal for discovering and organizing campus events with RSVP and notifications.",
            "repo_url": "https://github.com/example/campus-events",
            "languages": ["TypeScript", "JavaScript"],
            "frameworks": ["React", "Node.js"],
            "project_type": "Web Application",
            "domains": ["Community", "Events"],
            "skills": ["React", "TypeScript", "Node.js", "MongoDB"],
            "complexity": "beginner",
            "roles": ["Frontend Developer", "Backend Developer"],
            "owner_id": users[1].id
        },
        {
            "title": "EcoTracker Mobile App",
            "summary": "A mobile app that helps users track their carbon footprint and suggests eco-friendly alternatives for daily activities.",
            "repo_url": "https://github.com/example/eco-tracker",
            "languages": ["Dart", "JavaScript"],
            "frameworks": ["Flutter", "Node.js"],
            "project_type": "Mobile Application",
            "domains": ["Environment", "Mobile", "Sustainability"],
            "skills": ["Flutter", "Dart", "Node.js", "MongoDB", "UI/UX"],
            "complexity": "beginner",
            "roles": ["Mobile Developer", "Backend Developer", "UI Designer"],
            "owner_id": users[1].id
        },
        {
            "title": "DeFi Portfolio Manager",
            "summary": "A decentralized finance portfolio management tool that tracks investments across multiple DeFi protocols and provides analytics.",
            "repo_url": "https://github.com/example/defi-portfolio",
            "languages": ["Solidity", "TypeScript"],
            "frameworks": ["React", "Web3.js", "Hardhat"],
            "project_type": "Web Application",
            "domains": ["Blockchain", "Finance", "DeFi"],
            "skills": ["Solidity", "Web3", "React", "TypeScript", "Ethereum"],
            "complexity": "advanced",
            "roles": ["Blockchain Developer", "Frontend Developer", "Smart Contract Developer"],
            "owner_id": users[4].id
        },
        {
            "title": "Real-time Chat Application",
            "summary": "A modern chat application with real-time messaging, file sharing, and video calls using WebRTC.",
            "repo_url": "https://github.com/example/realtime-chat",
            "languages": ["TypeScript", "Python"],
            "frameworks": ["React", "FastAPI", "Socket.io"],
            "project_type": "Web Application",
            "domains": ["Communication", "Real-time", "WebRTC"],
            "skills": ["React", "TypeScript", "FastAPI", "WebRTC", "Socket.io"],
            "complexity": "intermediate",
            "roles": ["Full-stack Developer", "Frontend Developer", "Backend Developer"],
            "owner_id": users[2].id
        },
        {
            "title": "Fitness Tracker with AI",
            "summary": "A comprehensive fitness tracking app that uses computer vision to analyze workout form and provide personalized recommendations.",
            "repo_url": "https://github.com/example/ai-fitness-tracker",
            "languages": ["Python", "Swift", "Kotlin"],
            "frameworks": ["TensorFlow", "iOS", "Android"],
            "project_type": "Mobile Application",
            "domains": ["Health", "AI", "Mobile", "Computer Vision"],
            "skills": ["Python", "TensorFlow", "iOS", "Android", "Computer Vision"],
            "complexity": "advanced",
            "roles": ["ML Engineer", "Mobile Developer", "Computer Vision Engineer"],
            "owner_id": users[3].id
        },
        {
            "title": "Open Source Learning Platform",
            "summary": "A collaborative learning platform where students can create and share interactive coding tutorials and exercises.",
            "repo_url": "https://github.com/example/learning-platform",
            "languages": ["Python", "JavaScript", "TypeScript"],
            "frameworks": ["Django", "React", "PostgreSQL"],
            "project_type": "Web Application",
            "domains": ["Education", "Open Source", "Collaboration"],
            "skills": ["Python", "Django", "React", "TypeScript", "PostgreSQL"],
            "complexity": "intermediate",
            "roles": ["Full-stack Developer", "Frontend Developer", "Backend Developer"],
            "owner_id": users[0].id
        }
    ]
    
    for project_data in projects_data:
        project = models.Project(**project_data)
        db.add(project)
    
    db.commit()
    db.close()
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
