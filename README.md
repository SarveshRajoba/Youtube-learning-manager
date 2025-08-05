# YouTube Learning Manager

## Overview
A platform to manage, track, and summarize your YouTube learning journey. Features include playlist/video import, AI-powered video summarization, progress tracking, and learning goals.

## MVP Feature Scope
- User authentication (Devise + JWT)
- Import YouTube playlists and videos
- Track progress on videos (time, completion)
- Set learning goals for playlists/videos
- AI-generated video summaries (Gemini API planned)
- RESTful API for all resources

## Backend Stack
- Ruby on Rails 8 (API-only with session support for Devise)
- PostgreSQL
- Devise + Devise-JWT for authentication
- JSON:API serialization
- Dockerized for deployment

## Frontend Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui for styling
- React Router for navigation
- Axios for API communication
- React Query for state management

