# Alumni Platform (Backend + Frontend)

Full-stack monorepo for an Alumni social platform:
- Backend: Spring Boot (Java 17), MySQL, WebSocket, Cloudinary, Mail, JWT
- Frontend: React 18 + Vite, Axios, React Router, STOMP/SockJS

## Project Structure
- backend/ — Spring Boot API and WebSocket services
- frontend/ — React single-page application

## Tech Stack
- Backend: Spring Boot 2.6.x, JPA/Hibernate, MySQL 8, WebSocket, Cloudinary, Mail (Gmail SMTP), JWT
- Frontend: React 18, Vite 5, Axios, React Router, STOMP (`@stomp/stompjs`), `sockjs-client`

## Prerequisites
- Java 17 (JDK) and Maven (Maven Wrapper `mvnw.cmd` included)
- Node.js 18+ and npm
- MySQL 8 running locally or accessible remotely

## Backend Setup
1. Configuration
	- Copy `backend/src/main/resources/application-example.properties` to `backend/src/main/resources/application.properties`.
	- Update values for database, Cloudinary, and email credentials.
	- Prefer environment variables or a `.env` file (supported via `dotenv-java`) to avoid committing secrets.
	- Do NOT commit real secrets. Use the example file as a template.

2. Database
	- Create a database named `alumini_db` (or update the JDBC URL accordingly).
	- Optional: seed schema/data using `backend/src/main/resources/database_setup.sql`.

3. Run (development)
	- Windows:
	  ```bash
	  cd backend
	  .\mvnw.cmd spring-boot:run
	  ```
	- macOS/Linux:
	  ```bash
	  cd backend
	  ./mvnw spring-boot:run
	  ```
	- Default server: http://localhost:8080

4. Test
	- Windows:
	  ```bash
	  cd backend
	  .\mvnw.cmd test
	  ```
	- macOS/Linux:
	  ```bash
	  cd backend
	  ./mvnw test
	  ```

5. Build (production)
	- Windows:
	  ```bash
	  cd backend
	  .\mvnw.cmd clean package
	  java -jar target/alumini-platform-0.0.1-SNAPSHOT.jar
	  ```
	- macOS/Linux:
	  ```bash
	  cd backend
	  ./mvnw clean package
	  java -jar target/alumini-platform-0.0.1-SNAPSHOT.jar
	  ```

## Frontend Setup
1. Install & Run (development)
	```bash
	cd frontend
	npm install
	npm run dev
	```
	- App opens at http://localhost:3000

2. API Base URL
	- The frontend points to `http://localhost:8080` in `frontend/src/api/client.js`.
	- If you change ports or deploy the backend, update `baseURL` there.

3. Build (production)
	```bash
	cd frontend
	npm run build
	npm run preview -- --port 3000
	```
	- The built assets are in `frontend/dist/`.

## Features
- Auth: Register/Login for Alumni/Students; JWT stored in localStorage
- Feed: Public feed available without auth; Alumni can create posts (text + media via Cloudinary)
- Profile: Authenticated users can edit profile
- Chat: Real-time messaging via WebSocket/STOMP (if backend is running)
- Theme: Light/Dark toggle persisted in localStorage

## Configuration Notes
- CORS: The backend allows requests from `http://localhost:3000` (see `backend/src/main/java/.../config/CorsConfig.java`). Update if the frontend port/host changes.
- Secrets: Keep Cloudinary keys and mail passwords out of VCS. Use environment variables or externalized config.
- MySQL: Update JDBC URL, username, and password to match your local setup.

## Useful Paths
- Backend config template: `backend/src/main/resources/application-example.properties`
- Backend DB script: `backend/src/main/resources/database_setup.sql`
- Frontend API client: `frontend/src/api/client.js`

## Troubleshooting
- Port conflicts: Change `server.port` in backend `application.properties` or `vite.config.js` `server.port` for frontend.
- Connection issues: Verify MySQL is running and credentials in `application.properties` are correct.
- CORS errors: Ensure allowed origins include your frontend URL in backend CORS config.
