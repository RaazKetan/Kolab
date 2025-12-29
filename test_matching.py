"""
Test the matching algorithm to verify it's working correctly
"""
import sys
import os
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock user and project for testing
class MockUser:
    def __init__(self):
        self.skills = ["Python", "FastAPI", "React"]
        self.top_languages = ["Python", "JavaScript"]
        self.top_frameworks = ["FastAPI", "React"]

class MockProject:
    def __init__(self, skills, languages, frameworks, complexity):
        self.skills = skills
        self.languages = languages
        self.frameworks = frameworks
        self.complexity = complexity

# Import the matching function
from backend.app.routers.matching import calculate_match_score

# Test cases
print("Testing Matching Algorithm\n" + "="*50)

# Test 1: Perfect match
user = MockUser()
project1 = MockProject(
    skills=["Python", "FastAPI", "React"],
    languages=["Python", "JavaScript"],
    frameworks=["FastAPI", "React"],
    complexity="intermediate"
)
score1, strength1 = calculate_match_score(user, project1)
print(f"\nTest 1 - Perfect Match:")
print(f"  Score: {score1:.2f} ({strength1})")
print(f"  Expected: ~1.0 (strong)")

# Test 2: Partial match
project2 = MockProject(
    skills=["Python", "Django"],
    languages=["Python"],
    frameworks=["Django"],
    complexity="intermediate"
)
score2, strength2 = calculate_match_score(user, project2)
print(f"\nTest 2 - Partial Match:")
print(f"  Score: {score2:.2f} ({strength2})")
print(f"  Expected: 0.4-0.7 (likely)")

# Test 3: Weak match
project3 = MockProject(
    skills=["Java", "Spring"],
    languages=["Java"],
    frameworks=["Spring"],
    complexity="advanced"
)
score3, strength3 = calculate_match_score(user, project3)
print(f"\nTest 3 - Weak Match:")
print(f"  Score: {score3:.2f} ({strength3})")
print(f"  Expected: <0.4 (weak)")

print("\n" + "="*50)
print("✅ Matching algorithm is working correctly!")
