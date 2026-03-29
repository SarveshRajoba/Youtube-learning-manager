# YouTube Learning Manager

A full-stack web application that helps you organise, track, and understand your YouTube learning playlists. Import playlists from your YouTube account, track watch progress, set learning goals, and generate AI-powered summaries using Google Gemini.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (Rails API)](#2-backend-setup-rails-api)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Deployment](#deployment)

---

## Features

- **Authentication** – Sign up / log in with email & password, or sign in with Google OAuth (YouTube account linking included).
- **Playlist Management** – Import your YouTube playlists and individual videos; browse, search, and organise them.
- **Progress Tracking** – Track which videos you have watched and your completion percentage per playlist.
- **Goals** – Set learning goals with target dates, to-do lists, and status tracking.
- **AI Summaries** – Generate intelligent summaries for individual videos or entire playlists using Google Gemini. For small playlists (< 20 videos) the service fetches transcripts for higher-confidence summaries.
- **YouTube Sync** – Sync watch history and check which videos have been watched directly from your YouTube account.
- **Dashboard** – An overview of your learning stats at a glance.
- **Dark / Light Mode** – System-aware theme with manual override.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router v6, TanStack Query, Axios |
| Backend | Ruby on Rails 8 (API-only), PostgreSQL, Devise / JWT auth, Rack CORS, Rack Attack |
| AI | Google Gemini API (`gemini-flash-latest`) |
| YouTube | Google YouTube Data API v3, OAuth 2.0 (omniauth-google-oauth2) |
| Deployment | Frontend → Vercel, Backend → Render |

---

## Project Structure

```
Youtube-learning-manager/
├── backend/          # Rails 8 API
│   ├── app/
│   │   ├── controllers/   # auth, playlists, videos, goals, progress, AI summaries, dashboard, YouTube sync
│   │   ├── models/        # User, Playlist, Video, Progress, Goal, AiSummary
│   │   ├── serializers/
│   │   └── services/      # YoutubeService, PlaylistSummarizerService
│   ├── config/
│   │   ├── routes.rb
│   │   └── database.yml
│   ├── db/schema.rb
│   └── Gemfile
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── pages/         # Dashboard, Playlists, Goals, Progress, Profile, Summaries, Auth …
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── package.json
│   └── vite.config.ts
└── render.yaml       # Render deployment config
```

---

## Prerequisites

Make sure the following are installed on your machine:

- **Ruby** `3.4.2` (use [rbenv](https://github.com/rbenv/rbenv) or [rvm](https://rvm.io/))
- **Bundler** (`gem install bundler`)
- **Node.js** `>=18` and **npm** (or [bun](https://bun.sh/))
- **PostgreSQL** `>=14`
- A **Google Cloud project** with the following APIs enabled:
  - YouTube Data API v3
  - Google Identity / OAuth 2.0
- A **Google Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SarveshRajoba/Youtube-learning-manager.git
cd Youtube-learning-manager
```

---

### 2. Backend Setup (Rails API)

```bash
cd backend
```

#### Install Ruby dependencies

```bash
bundle install
```

#### Configure environment variables

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables) for all keys):

```bash
cp .env.example .env   # if an example file exists, otherwise create .env manually
```

#### Create and migrate the database

```bash
bin/rails db:create
bin/rails db:migrate
```

#### Generate a Rails master key (first-time setup)

```bash
bin/rails credentials:edit
```

This creates `config/master.key` and `config/credentials.yml.enc`. Keep `master.key` out of version control.

#### Start the backend server

```bash
bin/rails server
# Runs on http://localhost:3000 by default
```

---

### 3. Frontend Setup (React + Vite)

```bash
cd ../frontend
```

#### Install Node dependencies

```bash
npm install
# or: bun install
```

#### Configure environment variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
```

#### Start the development server

```bash
npm run dev
# or: bun dev
# Runs on http://localhost:8080 by default
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL (production). In development the default from `database.yml` is used. |
| `RAILS_MASTER_KEY` | Rails credentials master key (production). |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret from Google Cloud Console. |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key (server-side, for public playlist analysis). |
| `GEMINI_API_KEY` | Google Gemini API key for AI-powered summaries. |
| `JWT_SECRET` | Secret used to sign JWT tokens. |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the Rails backend (e.g. `http://localhost:3000` in development). |

---

## Running the Application

Once both servers are running you can open the app at **http://localhost:8080**.

| Service | URL |
|---------|-----|
| Frontend (Vite dev server) | http://localhost:8080 |
| Backend (Rails API) | http://localhost:3000 |
| Health check | http://localhost:3000/up |

---

## API Overview

The Rails backend exposes a JSON API. Key endpoint groups:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/signup` | Register a new user |
| `POST` | `/login` | Log in and receive a JWT |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET/PATCH` | `/profile` | View / update user profile |
| `GET/PATCH` | `/profile/password` | Change password |
| `CRUD` | `/playlists` | Manage playlists |
| `CRUD` | `/videos` | Manage videos |
| `CRUD` | `/goals` | Manage learning goals |
| `CRUD` | `/progresses` | Manage watch progress |
| `POST` | `/ai_summaries/generate` | Generate AI summary for a video |
| `POST` | `/ai_summaries/generate_playlist` | Generate AI summary for a saved playlist |
| `POST` | `/ai_summaries/analyze_public_playlist` | Analyse any public YouTube playlist by ID |
| `GET` | `/youtube/playlists` | Fetch playlists from linked YouTube account |
| `POST` | `/youtube/sync_progress` | Sync watch history from YouTube |
| `GET` | `/dashboard/stats` | Aggregated learning statistics |

---

## Deployment

The project ships with ready-to-use deployment configuration:

- **Backend → [Render](https://render.com/)** – configured in `render.yaml`. Set the required environment variables in the Render dashboard.
- **Frontend → [Vercel](https://vercel.com/)** – configured in `frontend/vercel.json`. Set `VITE_API_URL` to your Render backend URL in the Vercel project settings.

### Docker (Backend only)

A production `Dockerfile` is included in the `backend/` directory:

```bash
docker build -t yt-learning-manager-backend ./backend
docker run -d -p 80:80 \
  -e RAILS_MASTER_KEY=<your_master_key> \
  -e DATABASE_URL=<your_db_url> \
  --name yt-backend yt-learning-manager-backend
```
