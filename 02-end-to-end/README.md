# Online Coding Interview Platform

A real-time collaborative coding interview platform with secure code execution.

## Features
- **Real-time Collaboration**: Code together with live updates via WebSockets.
- **Multi-language Support**: JavaScript, Python, and Go.
- **Secure Execution**: Code execution simulated (or via WASM if binaries provided).
- **Session Management**: Instant session creation and sharing.

## getting Started

### Prerequisites
- Go 1.20+
- Node.js 16+
- NPM

### 1. Start Support (Unified)
To start both backend and frontend concurrently:
## Quick Start (Docker)

The easiest way to run the application is using Docker Compose.

```bash
docker-compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000).

## Local Development (Manual)

### Prerequisites
- Go 1.24+
- Node.js 20+
- PostgreSQL

### Backend
1. Set environment variables for DB:
   ```bash
   export DB_HOST=localhost
   export DB_USER=your_user
   export DB_PASSWORD=your_password
   export DB_NAME=coding_platform
   export DB_PORT=5432
   ```
2. Run the server:
   ```bash
   cd backend
   go run cmd/server/main.go
   ```

### Frontend
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```

### 3. Usage
1. Click **Create New Session**.
2. Share the URL with a candidate or interviewer.
3. Write code in the editor.
4. Click **Run Code** to execute it securely.
5. Changes are synced in real-time between participants.

## Architecture
- **Frontend**: React, Vite, TailwindCSS, Monaco Editor.
- **Backend**: Go, Gorilla WebSockets.
- **Execution**: WASM (wazero) / Mocked for demo.
