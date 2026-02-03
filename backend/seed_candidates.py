#!/usr/bin/env python3
"""
Standalone script to seed the candidate database with test data.
Run this script to populate the database with dummy candidates for testing the talent search feature.
"""
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine
from app import models
from app.gemini_agent import embed_text

def seed_candidates():
    """Seed database with dummy candidate data"""
    print("🌱 Starting candidate database seeding...")
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if candidates already exist
        existing_count = db.query(models.Candidate).count()
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} candidates. Skipping seed.")
            return
        
        dummy_candidates = [
            {
                "name": "Sarah Chen",
                "email": "sarah.chen@example.com",
                "phone": "+1-555-0101",
                "title": "Senior Full-Stack Engineer",
                "location": "San Francisco, CA",
                "experience_years": 8,
                "current_company": "TechCorp",
                "current_role": "Senior Software Engineer",
                "work_history": [
                    {"company": "TechCorp", "role": "Senior Software Engineer", "duration": "2020-Present", "description": "Lead development of microservices architecture using Node.js and React"},
                    {"company": "StartupXYZ", "role": "Full-Stack Developer", "duration": "2017-2020", "description": "Built e-commerce platform with React, Node.js, and PostgreSQL"},
                    {"company": "WebAgency", "role": "Junior Developer", "duration": "2015-2017", "description": "Developed client websites using JavaScript and PHP"}
                ],
                "skills": ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Kubernetes", "GraphQL", "REST APIs"],
                "certifications": ["AWS Certified Solutions Architect", "Google Cloud Professional"],
                "education": [{"degree": "BS Computer Science", "institution": "Stanford University", "year": 2015}],
                "summary": "Experienced full-stack engineer with 8 years building scalable web applications. Expert in React, Node.js, and cloud infrastructure. Led teams of 5+ developers and architected microservices for high-traffic applications."
            },
            {
                "name": "Marcus Johnson",
                "email": "marcus.j@example.com",
                "phone": "+1-555-0102",
                "title": "Machine Learning Engineer",
                "location": "New York, NY",
                "experience_years": 6,
                "current_company": "AI Innovations",
                "current_role": "ML Engineer",
                "work_history": [
                    {"company": "AI Innovations", "role": "ML Engineer", "duration": "2019-Present", "description": "Developed recommendation systems and NLP models using TensorFlow and PyTorch"},
                    {"company": "DataCorp", "role": "Data Scientist", "duration": "2017-2019", "description": "Built predictive models for customer analytics using Python and scikit-learn"}
                ],
                "skills": ["Python", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "SQL", "AWS SageMaker", "MLOps", "Deep Learning"],
                "certifications": ["TensorFlow Developer Certificate", "AWS Machine Learning Specialty"],
                "education": [{"degree": "MS Data Science", "institution": "MIT", "year": 2017}, {"degree": "BS Mathematics", "institution": "UC Berkeley", "year": 2015}],
                "summary": "Machine learning engineer specializing in NLP and recommendation systems. 6 years of experience deploying ML models to production. Strong background in deep learning and MLOps practices."
            },
            {
                "name": "Priya Patel",
                "email": "priya.patel@example.com",
                "phone": "+1-555-0103",
                "title": "DevOps Engineer",
                "location": "Austin, TX",
                "experience_years": 5,
                "current_company": "CloudScale",
                "current_role": "Senior DevOps Engineer",
                "work_history": [
                    {"company": "CloudScale", "role": "Senior DevOps Engineer", "duration": "2021-Present", "description": "Managed Kubernetes clusters and CI/CD pipelines for 50+ microservices"},
                    {"company": "FinTech Solutions", "role": "DevOps Engineer", "duration": "2018-2021", "description": "Automated infrastructure deployment using Terraform and Ansible"}
                ],
                "skills": ["Kubernetes", "Docker", "Terraform", "AWS", "Azure", "Jenkins", "GitLab CI", "Prometheus", "Grafana", "Python", "Bash"],
                "certifications": ["Certified Kubernetes Administrator", "AWS DevOps Professional", "HashiCorp Terraform Associate"],
                "education": [{"degree": "BS Computer Engineering", "institution": "University of Texas", "year": 2018}],
                "summary": "DevOps engineer with 5 years of experience in cloud infrastructure and automation. Expert in Kubernetes, Terraform, and CI/CD pipelines. Reduced deployment time by 70% through automation."
            },
        ]
        
        # Add more candidates (keeping it shorter for quick seeding)
        print(f"📝 Creating {len(dummy_candidates)} candidate records...")
        
        created_count = 0
        for candidate_data in dummy_candidates:
            # Generate embedding from candidate summary and skills
            embedding_text = f"{candidate_data['title']} {candidate_data['summary']} {' '.join(candidate_data['skills'])}"
            print(f"  → Generating embedding for {candidate_data['name']}...")
            candidate_vector = embed_text(embedding_text)
            
            if candidate_vector and len(candidate_vector) > 0:
                print(f"    ✓ Generated {len(candidate_vector)}-dimensional embedding")
            else:
                print(f"    ⚠️  Warning: Empty embedding generated")
            
            candidate = models.Candidate(
                name=candidate_data["name"],
                email=candidate_data["email"],
                phone=candidate_data.get("phone"),
                title=candidate_data["title"],
                location=candidate_data.get("location"),
                experience_years=candidate_data["experience_years"],
                current_company=candidate_data.get("current_company"),
                current_role=candidate_data.get("current_role"),
                work_history=candidate_data["work_history"],
                skills=candidate_data["skills"],
                certifications=candidate_data.get("certifications", []),
                education=candidate_data["education"],
                summary=candidate_data["summary"],
                candidate_vector=candidate_vector,
                is_active=True
            )
            db.add(candidate)
            created_count += 1
        
        db.commit()
        print(f"\n✅ Successfully seeded {created_count} candidates!")
        print(f"🎉 You can now use the Talent Search feature!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_candidates()
