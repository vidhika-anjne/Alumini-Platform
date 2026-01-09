# Alumni Platform Frontend

React + Vite frontend for the existing Spring Boot backend.

## Run locally

```bash
# From the frontend folder
npm install
npm run dev
```

Open http://localhost:3000 and use:
- Register/login as Alumni or Student
- Public feed at /feed (visible without auth)
- Alumni can create posts with text + media
- Authenticated users can edit their profile at /profile

## Theme
Use the theme toggle in the header to switch between light and dark. Theme preference is saved in localStorage.

## Configuration
The backend runs on http://localhost:8080 and already allows CORS from http://localhost:3000. If ports differ, update `src/api/client.js`.
