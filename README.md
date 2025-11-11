# To-Do Application

## Overview
This repository contains a simple To-Do application split into two containers:
- Backend: Express API providing REST endpoints and OpenAPI docs (CORS enabled for http://localhost:3000)
- Frontend: Next.js app providing the UI

Frontend now implements a modern Ocean-themed task manager consuming the /api/tasks backend for CRUD and completion toggles.

## Architecture
- Containers:
  - Backend (Express): simple-to-do-list-22681-22690/todo_backend
  - Frontend (Next.js): simple-to-do-list-22681-22691/todo_frontend
- Communication: Frontend calls Backend via REST over HTTP
- Ports:
  - Frontend: 3000
  - Backend: 3001 (running container reference) — set PORT=3001 for local dev alignment
- Dependencies:
  - Frontend depends on Backend for APIs
- API Docs: Backend serves Swagger UI at /docs with dynamic server URL detection

## Setup
- Backend: npm install, set PORT=3001, npm run dev
- Frontend: npm install, npm run dev
- Default API base URL for the frontend is http://localhost:3001/api.
  You can override via environment:
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

## API Summary
- Health: GET /api/health
- Tasks CRUD:
  - GET /api/tasks
  - POST /api/tasks
  - GET /api/tasks/:id
  - PUT /api/tasks/:id
  - DELETE /api/tasks/:id

## Frontend Features (Ocean Professional theme)
- Task list with filters (All, Active, Completed)
- Add task (title + optional description)
- Inline edit, toggle complete, delete
- Optimistic updates, loading and error states
- Theme colors: primary #2563EB, success/secondary #F59E0B, error #EF4444
- Base URL detection: uses NEXT_PUBLIC_API_BASE_URL if set; otherwise defaults to http://localhost:3001/api

## Local Development Workflow
- Start backend on port 3001
- Start frontend on port 3000
- Frontend communicates with backend via REST (e.g., http://localhost:3001/api)

## Notes
- Ensure the backend has CORS enabled for http://localhost:3000.
- The Next.js app shows the active API base URL in the header (to validate environment).
