# Azure DevOps Library Clone Tool

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-AGPLv3-blue)]()

A modern web application for replicating Azure DevOps Variable Groups (Libraries) between projects within the same organization. Built with React, TypeScript, and Express.

## Overview

The Azure DevOps Library Clone Tool simplifies the process of copying Variable Groups from one project to multiple target projects. Instead of manually recreating variables in each project, you can:

- **Connect securely** using your Azure DevOps Personal Access Token (PAT)
- **Browse projects** and select the source project containing the Variable Group
- **Choose Variable Groups** to replicate with a preview of variables
- **Select multiple target projects** for bulk cloning
- **Track results** with detailed success/failure reporting

### Key Features

- 🔒 **Secure** - PAT never stored permanently, only in session memory
- 🐳 **Docker Ready** - Single command deployment with docker-compose

## Prerequisites

- **Node.js 26+** (for local development, `24+` minimum — see `.nvmrc`)
- **Docker & Docker Compose** (for containerized deployment)
- **Azure DevOps Organization** with projects containing Variable Groups
- **Personal Access Token (PAT)** with the following scopes:
  - **Project and Team** → Read
  - **Variable Groups** → Read & Create

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd azdo-library-clone-tool

# Build and start the application
docker compose up --build

# Access the application
# App: http://localhost:3000
# API: http://localhost:3000/api
```

### Option 2: Manual Development Setup

Run the backend and the frontend in separate terminals:

```bash
# Terminal 1 — backend API (http://localhost:5000)
cd backend
npm install

# Use port 5000 in local dev to avoid clashing with Vite on :3000
echo "PORT=5000" > .env
npm run dev
```

```bash
# Terminal 2 — frontend dev server (http://localhost:3000)
cd frontend
npm install
npm run dev
# /api requests are proxied to the backend on :5000 (see vite.config.ts)
```

To run the production bundle locally (backend serves API + static frontend on `:3000`):

```bash
cd backend
npm run build
NODE_ENV=production npm run start:prod
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |

### Development Configuration

Create a `.env` file in the `backend` directory (loaded automatically via `dotenv`):

```env
# Local dev: 5000 (avoids clashing with the Vite dev server on :3000).
# Production default (Docker or NODE_ENV=production): 3000.
PORT=5000
```

The frontend needs no extra config for local dev: `/api` is proxied to
`http://localhost:5000` (see `frontend/vite.config.ts`). Optionally, create a
`.env.local` file in the `frontend` directory to point elsewhere:

```env
VITE_API_URL=http://localhost:5000
```

> Local dev: frontend Vite at `http://localhost:3000` with `/api` proxy → backend at `http://localhost:5000`.
> Production (Docker): single app at `http://localhost:3000` (backend serves API + static frontend).

## Usage Guide

### 1. Connect to Azure DevOps

1. Open the application in your browser at http://localhost:3000
2. Enter your **Organization URL** (e.g., `https://dev.azure.com/myorg` or `https://myorg.visualstudio.com` — a trailing `/` is accepted)
3. Enter your **Personal Access Token (PAT)**
4. Click **Connect**

> If the URL or token is invalid, a red alert explains the problem instead of silently doing nothing.

### 2. Select Source Project

1. After connecting, you'll see a list of all projects in your organization
2. Use the search box to filter projects by name
3. Click on a project to select it as the source
4. Click **Next**

### 3. Choose Variable Group

1. The application fetches all Variable Groups from the selected project
2. Browse the list - each group shows the variable count and description
3. Click on a Variable Group to select it
4. Click **Next**

### 4. Select Target Projects

1. All projects except the source are listed as potential targets
2. Use checkboxes to select individual projects
3. Use **Select All** / **Clear All** for bulk actions
4. The clone button shows the number of selected targets
5. Click **Clone to N project(s)**

### 5. Review Results

- **Success**: Green checkmark with new Variable Group ID
- **Partial Success**: Warning with count of successful/failed clones
- **Error**: Red alert with details

Click **Start New Clone** to begin another operation.

## PAT Creation Guide

1. Go to **Azure DevOps** → **User Settings** (top right) → **Personal Access Tokens**
2. Click **New Token**
3. Configure:
   - **Name**: `Library Clone Tool`
   - **Expiration**: Choose appropriate duration
   - **Scopes**:
     - ✅ **Project and Team** → Read
     - ✅ **Variable Groups** → Read & Create
4. Click **Create**
5. **Copy the token immediately** - you won't see it again!

[Detailed Azure DevOps PAT Documentation](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)

## API Reference

### GET `/api/health`

Smoke test — no parameters.

**Response:**
```json
{
  "status": "ok"
}
```

### POST `/api/projects`

List all projects in the organization.

**Request:**
```json
{
  "orgUrl": "https://dev.azure.com/myorg",
  "token": "your-pat-token"
}
```

**Response:**
```json
[
  {
    "id": "project-guid",
    "name": "MyProject",
    "description": "Project description",
    "url": "https://dev.azure.com/myorg/_apis/projects/project-guid",
    "state": "wellFormed",
    "revision": 1,
    "visibility": "private",
    "lastUpdateTime": "2024-01-15T10:30:00Z"
  }
]
```

### POST `/api/variable-groups`

List Variable Groups in a project.

**Request:**
```json
{
  "orgUrl": "https://dev.azure.com/myorg",
  "token": "your-pat-token",
  "projectName": "MyProject"
}
```

**Response:**
```json
[
  {
    "id": 123,
    "name": "Build Variables",
    "description": "Variables for build pipelines",
    "type": "Vsts",
    "variables": {
      "API_URL": { "value": "https://api.example.com", "isSecret": false },
      "API_KEY": { "value": "secret-value", "isSecret": true }
    }
  }
]
```

### POST `/api/clone-variable-group`

Clone a Variable Group to target projects.

**Request:**
```json
{
  "orgUrl": "https://dev.azure.com/myorg",
  "token": "your-pat-token",
  "sourceProject": "SourceProject",
  "targetProjects": ["TargetProject1", "TargetProject2"],
  "variableGroupId": 123
}
```

**Response (success — one entry per cloned target):**
```json
{
  "message": "Clone completed successfully!",
  "results": [
    { "project": "TargetProject1", "status": "Success", "newGroupId": 456 }
  ]
}
```

**Response (failure — non-2xx status):**
```json
{
  "error": "Authentication failed. Check your PAT token and its scopes/permissions for this organization."
}
```

## Project Structure

```
azdo-library-clone-tool/
├── backend/                   # Express API + static frontend serving
│   ├── src/
│   │   └── server.ts          # API endpoints, request logging, frontend serving
│   ├── dist/                  # Compiled output (generated by `npm run build`)
│   ├── public/                # Frontend build output (generated by Docker build)
│   ├── package.json           # `build`, `start`, `start:prod`, `dev` (ts-node)
│   └── tsconfig.json
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── pages/             # ConnectionPage.tsx, CloneWizardPage.tsx
│   │   ├── context/           # AuthContext.tsx, WizardContext.tsx
│   │   ├── hooks/             # useApi.ts (API client)
│   │   ├── components/        # UI, layout, navigation, feedback components
│   │   ├── types/             # API TypeScript types
│   │   ├── theme/             # ThemeProvider.tsx, tokens.css (design tokens)
│   │   ├── App.tsx            # Main app with routing
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles + component classes
│   ├── index.html
│   ├── package.json           # `dev`/`preview` pinned to :3000 (`--strictPort`)
│   ├── vite.config.ts         # Dev server :3000, `/api` proxy → backend :5000
│   ├── tailwind.config.js     # Palette mapped to CSS variables (no `/opacity` modifiers on these colors)
│   ├── postcss.config.js
│   ├── nginx.conf             # Reference proxy config (backend:3000)
│   └── .env.example           # Optional VITE_API_URL override
├── compose.yaml               # Single service, maps 3000:3000
├── Dockerfile                 # Builds backend + frontend, serves both on :3000
├── LICENSE                    # AGPL-3.0 license text
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run linting: `npm run lint` (if configured)
5. Run type checking: `npm run typecheck` (if configured)
6. Run tests: `npm test` (if configured)
7. Commit with conventional commits: `git commit -m "feat: add new feature"`
8. Push to your fork: `git push origin feature/my-feature`
9. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.
