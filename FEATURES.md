# Origin - Complete Features & Pages Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Authentication](#user-authentication)
3. [Core Features](#core-features)
4. [Pages & Views](#pages--views)
5. [API Endpoints](#api-endpoints)
6. [Technical Architecture](#technical-architecture)

---

## Overview

**Origin** is an AI-powered talent and project collaboration platform that connects professionals, students, and organizations through intelligent project matching, natural language talent search, and comprehensive skill gap analysis.

### Platform Purpose
- Enable users to discover and collaborate on real-world projects
- Match talent with opportunities using AI-powered algorithms
- Provide skill gap analysis and personalized learning roadmaps
- Facilitate meaningful connections between collaborators

---

## User Authentication

### Landing Page
**Component**: `LandingPage.jsx`

**Features**:
- Modern, responsive hero section with platform introduction
- Feature highlights with visual icons
- Dual authentication forms (Login/Register)
- Smooth transitions between login and registration modes

**User Actions**:
- **Login**: Email and password authentication
- **Register**: Create new account with name, email, and password
- Auto-login after successful registration

---

## Core Features

### 1. Project Discovery (Swipe Interface)

**Page**: Discover
**Component**: `ProjectCard.jsx`, `MatchCard.jsx`

**Description**: interface for discovering projects that match your skills and interests.

**Features**:
- **AI-Powered Matching**: Projects recommended based on user skills, interests, and experience
- **Intelligent Search**: Natural language search for specific project types
  - Example queries: "React beginner projects", "AI mobile apps", "Full-stack web development"
- **Project Cards** display:
  - Project title and summary
  - Repository URL (if available)
  - Tech stack (languages, frameworks)
  - Project type and complexity level
  - Required skills and collaboration roles
  - Project owner information
- **Swipe Actions**:
  - ❤️ **Like**: Express interest in collaborating
  - ❌ **Pass**: Skip to next project
- **Re-show Feature**: When all new projects are viewed, previously passed projects are shown again
- **Search Suggestions**: AI-generated tips to refine search queries

**User Flow**:
1. View project card with full details
2. Swipe right (like) or left (pass)
3. If liked, wait for project owner approval
4. Once approved, project appears in "Matches" for messaging

---

### 2. Project Matching & Messaging

**Page**: Matches
**Component**: `MatchCard.jsx`, `ChatView.jsx`

**Description**: View all projects you've liked that have been approved by owners, with real-time messaging.

**Features**:
- **Match Grid**: Visual grid of all matched projects
- **Notification Badges**: Unread message counts on each match
- **Project Details**: View full project information
- **Owner Profiles**: View project owner details
- **Real-time Chat**:
  - Send and receive messages
  - Message history
  - Typing indicators
  - Message notifications
  - Auto-refresh every 10 seconds

**User Actions**:
- View project details
- View owner profile
- Open chat conversation
- Send messages
- Mark messages as read

---

### 3. Post Project

**Page**: Post Project
**Component**: `PostProject.jsx`

**Description**: Create and publish projects to find collaborators.

**Features**:
- **Manual Entry**: Fill out project details manually
- **GitHub Auto-Fill**: Analyze GitHub repository and auto-populate fields
  - Extracts: title, summary, languages, frameworks, skills, complexity
  - Uses AI to analyze README and code structure
- **Project Fields**:
  - Title (required)
  - Summary/Description (required)
  - Repository URL (optional)
  - Primary Languages (comma-separated)
  - Frameworks & Libraries (comma-separated)
  - Project Type (Web App, Mobile App, Desktop App, etc.)
  - Domains (AI, Education, Healthcare, etc.)
  - Required Skills (comma-separated)
  - Complexity Level (Beginner, Intermediate, Advanced)
  - Collaboration Roles (Frontend Dev, Backend Dev, Designer, etc.)

**User Flow**:
1. Click "Post Project" in navigation
2. Either manually fill form or paste GitHub URL for auto-fill
3. Review and edit auto-filled information
4. Submit project
5. Project appears in discovery feed for other users

---

### 4. My Projects

**Page**: My Projects
**Component**: `MyProjects.jsx`

**Description**: Manage all projects you've created.

**Features**:
- **Project List**: Grid view of all your projects
- **Project Stats**: View engagement metrics
- **Edit Projects**: Update project details
- **Delete Projects**: Remove projects from platform
- **View Likes**: See who has liked your projects

**User Actions**:
- View all owned projects
- Edit project details
- Delete projects
- Navigate to "Project Likes" to manage interested users

---

### 5. Project Likes Management

**Page**: Project Likes
**Component**: `ProjectLikes.jsx`

**Description**: Manage users who have liked your projects and approve/reject collaboration requests.

**Features**:
- **Project Selection**: Dropdown to select which project to manage
- **User Cards**: Display users who liked the project with:
  - Name and username
  - Profile picture
  - Bio
  - Skills (with color-coded badges)
  - Organization (college/company)
  - GitHub profile link
- **Approval Actions**:
  - ✅ **Approve**: Allow user to chat about the project
  - ❌ **Reject**: Decline collaboration request
- **Profile Viewing**: Click to view full user profile

**User Flow**:
1. Select a project from dropdown
2. View list of users who liked it
3. Review user profiles and skills
4. Approve or reject each user
5. Approved users can now message you about the project

---

### 6. Talent Search (AI-Powered)

**Page**: Search Talent
**Component**: `TalentSearch.jsx`, `SkillGapAnalysis.jsx`

**Description**: Natural language search for candidates with AI-powered skill gap analysis.

**Features**:

#### Natural Language Search
- **Conversational Queries**: Search using plain English
  - Example: "Find React developers with 2+ years experience"
  - Example: "Python backend engineers familiar with FastAPI"
- **AI-Powered Matching**: Semantic search using vector embeddings
- **Match Scores**: Candidates ranked by relevance (0-100%)
- **Candidate Cards** display:
  - Name, username, profile picture
  - Bio and experience summary
  - Skills with visual badges
  - Organization and role
  - GitHub profile
  - Match score percentage

#### Skill Gap Analysis
**Integrated AI Feature**

**Purpose**: Analyze candidate readiness for specific roles using interview transcripts.

**Features**:
- **Interview Analysis**: Paste interview transcript
- **Target Role**: Specify desired position
- **AI-Generated Report**:
  - **Readiness Score** (0-100%): Overall deployment readiness
  - **Strengths**: Identified strong skills
  - **Skill Gaps**: Prioritized list of missing/weak skills
    - High/Medium/Low priority color coding
    - Impact analysis for each gap
  - **Personalized Learning Roadmap**:
    - Phase-based learning plan (Foundation → Intermediate → Advanced)
    - Timeline estimates for each phase
    - Specific topics to learn
  - **Course Recommendations**:
    - Curated courses from Udemy, Coursera, YouTube
    - Direct links to resources
    - Difficulty levels
- **Deployment Recommendation**: AI assessment of when candidate will be ready

**User Flow**:
1. Search for candidates using natural language
2. Review ranked results with match scores
3. Click "Analyze Skills" on a candidate
4. Enter target role and paste interview transcript
5. Review comprehensive AI-generated analysis
6. Make informed hiring/collaboration decisions

---

### 7. Find Collaborators (Requirements-Based)

**Page**: Find Collaborators
**Component**: `RequirementsPage.jsx`

**Description**: Describe project requirements and get AI-matched collaborator recommendations.

**Features**:
- **Requirements Input**: Describe what you're looking for in natural language
  - Example: "I need a full-stack developer for a React + Node.js e-commerce platform"
- **AI Matching**: Analyzes requirements and matches with user profiles
- **Recommended Collaborators**:
  - User cards with skills, bio, organization
  - Direct actions: View Profile or Message
- **Smart Filtering**: Considers skills, experience, and availability

**User Flow**:
1. Describe project requirements
2. Click "Find Matching Collaborators"
3. Review AI-recommended users
4. View profiles or send messages

---

### 8. User Profile Management

**Pages**: Profile View, Profile Edit
**Components**: `ProfileView.jsx`, `ProfileEdit.jsx`

#### Profile View

**Features**:
- **Personal Information**:
  - Name, username, email
  - Bio/About section
  - Organization (college/company)
  - Role/Position
- **Skills Display**: Color-coded skill badges
- **GitHub Integration**:
  - Link GitHub profile
  - Analyze repositories to auto-detect skills
  - Repository cards showing:
    - Repository name and description
    - Detected languages
    - Detected frameworks/technologies
  - Add/Remove repositories
- **Experience Section**: Work history and education
- **Edit Button**: Navigate to profile editing

#### Profile Edit

**Features**:
- **Editable Fields**:
  - Name
  - Bio
  - Skills (comma-separated)
  - Organization name
  - Organization type (College/Company)
  - GitHub URL
- **Save Changes**: Update profile information
- **Cancel**: Return to profile view without saving

#### GitHub Repository Analysis

**Integrated Feature**

**How it works**:
1. Enter GitHub repository URL
2. Click "Analyze Repository"
3. AI analyzes:
   - README content
   - Code files
   - Package files (package.json, requirements.txt, etc.)
4. Extracts:
   - Programming languages
   - Frameworks and libraries
   - Technologies used
5. Displays results with color-coded badges
6. Option to add to profile
7. Detected skills merge with existing profile skills

---

### 9. Chat & Messaging

**Page**: Chat View
**Component**: `ChatView.jsx`

**Description**: Real-time messaging for matched projects.

**Features**:
- **Message Thread**: Chronological chat history
- **User Identification**: Messages color-coded by sender
- **Other Person Info**: Display chat partner's details
- **Send Messages**: Text input with send button
- **Auto-Refresh**: Messages update every 10 seconds
- **Read Receipts**: Mark messages as read when opened
- **Notifications**: Badge counts for unread messages

**User Flow**:
1. Click on a match from Matches page
2. View message history
3. Type and send messages
4. Receive real-time updates
5. Return to matches list

---

### 10. Project & User Details

**Pages**: Project Details, User Details
**Components**: `ProjectDetails.jsx`, `UserDetails.jsx`

#### Project Details

**Features**:
- Full project information display
- Repository link
- Tech stack breakdown
- Required skills and roles
- Complexity level
- Project owner information
- Back navigation

#### User Details

**Features**:
- Complete user profile
- Skills and experience
- Organization details
- GitHub profile link
- Bio and background
- Contact options
- Back navigation

---

## Pages & Views

### Complete Page List

| Page | Route/View | Component | Description |
|------|-----------|-----------|-------------|
| **Landing** | `login` | `LandingPage.jsx` | Authentication and platform introduction |
| **Discover** | `discover` | `ProjectCard.jsx` | Swipe interface for project discovery |
| **Matches** | `matches` | `MatchCard.jsx` | View all matched projects |
| **Chat** | `chat` | `ChatView.jsx` | Message conversations |
| **Post Project** | `postProject` | `PostProject.jsx` | Create new projects |
| **My Projects** | `myProjects` | `MyProjects.jsx` | Manage owned projects |
| **Project Likes** | `projectLikes` | `ProjectLikes.jsx` | Approve/reject collaboration requests |
| **Search Talent** | `searchTalent` | `TalentSearch.jsx` | AI-powered candidate search |
| **Find Collaborators** | `requirements` | `RequirementsPage.jsx` | Requirements-based matching |
| **Profile View** | `profile` | `ProfileView.jsx` | View user profile |
| **Profile Edit** | `profileEdit` | `ProfileEdit.jsx` | Edit profile information |
| **Project Details** | `projectDetails` | `ProjectDetails.jsx` | Detailed project view |
| **User Details** | `userDetails` | `UserDetails.jsx` | Detailed user profile view |

---

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user and get JWT token
- `GET /auth/me` - Get current user profile

### Projects (`/projects`)
- `GET /projects/` - List all projects
- `GET /projects/{id}` - Get specific project
- `POST /projects/` - Create new project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Matching (`/matching`)
- `GET /matching/discover` - Get next recommended project
- `POST /matching/swipe` - Like or pass on project
- `GET /matching/matches` - Get user's matched projects
- `GET /matching/recommendations` - Get AI recommendations

### Talent Search (`/talent`)
- `POST /talent/search` - Search candidates with natural language
- `POST /talent/seed` - Seed database with demo candidates
- `GET /talent/candidate/{id}` - Get candidate details

### Skill Gap Analysis (`/skill-gap`)
- `POST /skill-gap/analyze` - Analyze interview and generate roadmap
- `GET /skill-gap/candidate/{candidate_id}` - Get candidate's analyses
- `GET /skill-gap/analysis/{analysis_id}` - Get specific analysis

### GitHub Integration (`/analyze-repo`)
- `POST /analyze-repo/user-repo` - Analyze GitHub repository
- `POST /repo-projects/create` - Create project from GitHub repo

### Users (`/users`)
- `GET /users/` - List all users
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile
- `POST /users/{user_id}/repositories` - Add repository to profile
- `DELETE /users/{user_id}/repositories/{index}` - Remove repository

### Chat (`/chat`)
- `GET /chat/{project_id}` - Get chat messages for project
- `POST /chat/` - Send new message
- `POST /chat/{project_id}/mark-read` - Mark messages as read
- `GET /chat/notifications/{user_id}` - Get message notifications

### Requirements (`/requirements`)
- `POST /requirements/analyze` - Analyze requirements and find collaborators
- `POST /requirements/process` - Process project requirements
- `GET /requirements/template` - Get requirements template

### AI Search (`/ai`)
- `POST /ai/search` - Intelligent project search with natural language

### Profile (`/profile`)
- `GET /profile/setup` - Get profile setup status
- `POST /profile/setup` - Complete profile setup

---

## Technical Architecture

### Frontend Stack
- **React** - Component-based UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Modern JavaScript** - ES6+ features

### Backend Stack
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM for database management
- **SQLite/PostgreSQL** - Database (SQLite for dev, PostgreSQL for production)
- **Google Gemini AI** - Advanced language model for:
  - Natural language search
  - Skill gap analysis
  - Repository analysis
  - Requirements matching
- **JWT** - Secure token-based authentication
- **Pydantic** - Data validation and serialization

### AI Features

#### 1. Semantic Search
- **Vector Embeddings**: Convert text to numerical vectors
- **Cosine Similarity**: Match queries with projects/candidates
- **Natural Language Processing**: Understand conversational queries

#### 2. Repository Analysis
- **Code Parsing**: Analyze file structures and imports
- **README Analysis**: Extract project information
- **Technology Detection**: Identify languages, frameworks, tools

#### 3. Skill Gap Analysis
- **Interview Transcript Processing**: Extract skills and competencies
- **Gap Identification**: Compare with target role requirements
- **Learning Path Generation**: Create personalized roadmaps
- **Resource Recommendation**: Suggest relevant courses

#### 4. Intelligent Matching
- **Multi-factor Scoring**: Consider skills, experience, interests
- **Collaborative Filtering**: Learn from user interactions
- **Continuous Improvement**: Refine recommendations over time

### Database Schema

**Key Models**:
- **User**: User accounts, profiles, skills
- **Project**: Project details, requirements, tech stack
- **Swipe**: User interactions with projects (like/pass)
- **ChatMessage**: Messages between users
- **SkillGapAnalysis**: Stored analysis results
- **Repository**: GitHub repositories linked to profiles

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt encryption
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Pydantic schema validation
- **SQL Injection Prevention**: ORM-based queries

---

## Key User Flows

### 1. New User Onboarding
1. Visit landing page
2. Register with email and password
3. Auto-login after registration
4. Redirected to Discover page
5. Start swiping on projects

### 2. Finding Collaborators for a Project
1. Create project via "Post Project"
2. Fill details or use GitHub auto-fill
3. Submit project
4. Wait for users to like project
5. Review likes in "Project Likes"
6. Approve interested users
7. Chat with approved collaborators

### 3. Joining a Project
1. Browse projects in Discover
2. Use search to find specific types
3. Like interesting projects
4. Wait for owner approval
5. View approved projects in Matches
6. Chat with project owner
7. Collaborate on project

### 4. Hiring/Finding Talent
1. Navigate to "Search Talent"
2. Enter natural language query
3. Review ranked candidates
4. Click "Analyze Skills" on candidate
5. Enter target role and interview transcript
6. Review AI-generated analysis
7. Make hiring decision
8. Contact candidate

### 5. Building Your Profile
1. Navigate to Profile
2. Click Edit
3. Add bio, skills, organization
4. Add GitHub URL
5. Analyze repositories
6. Confirm detected skills
7. Save profile
8. Skills appear on project cards

---

## Notifications & Real-time Features

### Message Notifications
- **Badge Counts**: Unread message counts on match cards
- **Auto-Refresh**: Notifications update every 10 seconds
- **Read Receipts**: Messages marked as read when viewed
- **Persistent Badges**: Counts persist until messages are read

### Project Updates
- **New Matches**: Notification when project owner approves your like
- **New Likes**: Notification when someone likes your project
- **New Messages**: Real-time message notifications

---

## Search & Discovery Features

### Intelligent Search
- **Natural Language**: Use conversational queries
- **Semantic Matching**: Understands intent, not just keywords
- **Search Suggestions**: AI-generated tips to refine queries
- **Real-time Results**: Instant search as you type
- **Debounced Input**: Optimized search performance

### Discovery Algorithm
- **Skill-Based Matching**: Projects aligned with your skills
- **Interest-Based**: Considers your project interactions
- **Complexity Matching**: Appropriate difficulty levels
- **Diversity**: Mix of project types and domains
- **Re-show Logic**: Revisit passed projects when no new ones available

---

## Mobile Responsiveness

All pages are fully responsive with:
- **Mobile-First Design**: Optimized for small screens
- **Responsive Grid**: Adapts to screen size
- **Touch-Friendly**: Large tap targets for mobile
- **Readable Typography**: Scales appropriately
- **Optimized Images**: Fast loading on mobile networks

---

## Future Enhancements

Potential features for future development:
- Video chat integration
- File sharing in messages
- Project milestones and task management
- Team formation tools
- Skill endorsements
- Project portfolios
- Advanced analytics dashboard
- Mobile app (iOS/Android)
- Integration with more code repositories (GitLab, Bitbucket)
- Calendar integration for meetings
- Payment/compensation features

---

## Support & Documentation

For additional help:
- **API Documentation**: Available at `/docs` endpoint (FastAPI auto-generated)
- **README Files**: See main README.md, backend/README.md, frontend/README.md
- **Deployment Guides**: VERCEL_DEPLOYMENT.md, CLOUD_SQL_SETUP.md, DEPLOYMENT.md
- **Environment Setup**: ENV_SETUP.md

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Platform Name**: Origin
