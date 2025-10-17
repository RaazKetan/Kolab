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
            "username": "arjun_sharma",
            "name": "Arjun Sharma",
            "email": "arjun@example.com",
            "password": "arjun123",
            "skills": ["Python", "Django", "React", "PostgreSQL", "AWS"],
            "bio": "Full-stack developer from Bangalore, passionate about building scalable web applications. I love working on fintech and e-commerce projects.",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "priya_patel",
            "name": "Priya Patel",
            "email": "priya@example.com",
            "password": "priya123",
            "skills": ["React", "TypeScript", "Node.js", "MongoDB", "Express"],
            "bio": "Frontend developer from Mumbai, specializing in React and modern JavaScript. I enjoy creating beautiful user interfaces and have experience in EdTech startups.",
            "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "rajesh_kumar",
            "name": "Rajesh Kumar",
            "email": "rajesh@example.com",
            "password": "rajesh123",
            "skills": ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
            "bio": "Backend developer from Delhi with expertise in Java and microservices architecture. I work on enterprise applications and love solving complex technical challenges.",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "anita_desai",
            "name": "Anita Desai",
            "email": "anita@example.com",
            "password": "anita123",
            "skills": ["Python", "Machine Learning", "TensorFlow", "Pandas", "Scikit-learn"],
            "bio": "Data scientist from Pune, passionate about AI and machine learning. I specialize in computer vision and NLP, and love working on healthcare tech projects.",
            "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "vikram_singh",
            "name": "Vikram Singh",
            "email": "vikram@example.com",
            "password": "vikram123",
            "skills": ["React Native", "Flutter", "iOS", "Android", "Firebase"],
            "bio": "Mobile app developer from Chennai, building cross-platform applications. I have experience in fintech and social media apps, and love creating smooth user experiences.",
            "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "sneha_reddy",
            "name": "Sneha Reddy",
            "email": "sneha@example.com",
            "password": "sneha123",
            "skills": ["Solidity", "Web3", "React", "TypeScript", "Ethereum"],
            "bio": "Blockchain developer from Hyderabad, passionate about DeFi and Web3. I build smart contracts and dApps, and love exploring the future of decentralized finance.",
            "avatar_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "rohit_verma",
            "name": "Rohit Verma",
            "email": "rohit@example.com",
            "password": "rohit123",
            "skills": ["JavaScript", "Vue.js", "Nuxt.js", "CSS", "Figma"],
            "bio": "Frontend developer from Kolkata, specializing in Vue.js and modern web technologies. I create pixel-perfect designs and love working on creative projects.",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            "username": "kavya_joshi",
            "name": "Kavya Joshi",
            "email": "kavya@example.com",
            "password": "kavya123",
            "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis"],
            "bio": "Backend developer from Ahmedabad, building robust APIs and microservices. I specialize in Python and have experience in e-commerce and fintech platforms.",
            "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
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
