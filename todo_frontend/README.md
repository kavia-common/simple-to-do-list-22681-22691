This is a Next.js app for the Ocean Tasks frontend.

Quick start:
1) Install dependencies
   npm install

2) Run the development server
   npm run dev

The app runs on http://localhost:3000 and expects the backend API at http://localhost:3001/api by default.

Environment configuration:
- NEXT_PUBLIC_API_BASE_URL: Optionally set a custom API base, e.g.
  NEXT_PUBLIC_API_BASE_URL=https://your-host:3001/api

Features:
- Task list with filters (All, Active, Completed)
- Add task (title + optional description)
- Edit inline, toggle complete, delete
- Optimistic updates, loading and error states
- Ocean Professional theme (primary #2563EB, success/secondary #F59E0B, error #EF4444)

Notes:
- Ensure your backend (Express) is running with CORS enabled for http://localhost:3000.
- The UI shows the active API base URL in the top-right to help verify environment.
