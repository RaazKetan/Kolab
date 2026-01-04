# Origin Frontend

The frontend is built with React and Vite, using Tailwind CSS for styling. It provides a modern, responsive interface for users to discover projects, manage their profiles, and collaborate.

## Directory Structure (`/src`)

- **`main.jsx`**: Application entry point. Mounts the React app.
- **`App.jsx`**: Main component handling routing and global layout structure.

### Components (`/src/components`)

#### Core Pages & Navigation
- **`LandingPage.jsx`**: The initial landing page with hero section and feature overview.
- **`Navigation.jsx`**: The top navigation bar, handling links to different sections (Dashboard, Projects, Profile, etc.).
- **`Header.jsx`**: A header component (usage depends on specific layouts).

#### Authentication
- **`Authform.jsx`**: Handles both generic login and registration forms.
- **`Login.jsx`** / **`Register.jsx`**: (If present, usually wrapper components around Authform or specific implementations).

#### Profile Management
- **`ProfileView.jsx`**: distinct view for the user's profile. Includes the **Repository Management** section where users can add and analyze GitHub repositories.
- **`ProfileEdit.jsx`**: Form to edit profile details (Bio, Skills, Organization, Github URL).
- **`UserDetails.jsx`**: A view component to see *other* users' profiles (e.g., when matching).

#### Project Management
- **`PostProject.jsx`**: A comprehensive form for creating new projects. Includes AI-assisted auto-fill from GitHub repo URLs.
- **`MyProjects.jsx`**: Dashboard for users to view and manage projects they own.
- **`ProjectDetails.jsx`**: detailed view of a specific project, including description, tech stack, and roles.
- **`ProjectCard.jsx`**: A summary card component for displaying projects in lists or grids.

#### Matching & Discovery
- **`MatchCard.jsx`**: The swipeable card component used in the discovery interface.
- **`ProjectLikes.jsx`**: View for project owners to see who has liked (swiped right on) their projects.

#### Features
- **`RequirementsPage.jsx`**: An interactive, chat-like interface where AI interviews the user to generating project requirements and templates.
- **`ChatView.jsx`**: The real-time chat interface for users who have matched.

## Key Features

- **Repository Analysis**: Users can analyze their GitHub repositories directly from the profile view errors are handled gracefully and results are displayed with colored badges.
- **AI-Assisted Project Creation**: "Auto-Fill" feature in PostProject uses AI to scrape a GitHub repo and fill in project details.
- **Swipe-to-Match**: An engaging UI for developers to find projects and for project owners to find talent.
- **Responsive Design**: precise styling using Tailwind CSS.

## Setup

1. Ensure Node.js is installed.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
