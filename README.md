# BitsVision

### Where Every Number Reveals Its Binary Identity.

A calculator that shows how internal CPU-level binary calculations work, powered by a React frontend and an Express + MongoDB backend.

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 19, Vite, Tailwind CSS  |
| Backend  | Node.js, Express              |
| Database | MongoDB (via Mongoose)        |

## Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017

### Install MongoDB (if not installed)

Download from https://www.mongodb.com/try/download/community and run it, or use:

```bash
# Windows (with chocolatey)
choco install mongodb

# Start MongoDB service
net start MongoDB
```

---

## Setup & Run

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 3. Start MongoDB

Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

### 4. Start the backend (in one terminal)

```bash
cd server
npm run dev
```

Server runs on http://localhost:5000

### 5. Start the frontend (in another terminal)

```bash
npm run dev
```

Frontend runs on http://localhost:5173

---

## API Endpoints

| Method | Route              | Description                  |
|--------|--------------------|------------------------------|
| POST   | /api/calculate     | Perform a calculation        |
| GET    | /api/history       | Get last 50 calculations     |
| DELETE | /api/history       | Clear all history            |
| DELETE | /api/history/:id   | Delete a single entry        |
| GET    | /api/health        | Server health check          |

### POST /api/calculate

```json
{ "a": 10, "b": 5, "operator": "+" }
```

Returns result, binary model, and saved history ID.

---

## Offline Mode

If the server is not running, BitsVision still works fully — calculations happen locally in the browser. The header badge shows "Offline mode" vs "Server online".

---

## Deployment

| Layer    | Recommended Service  |
|----------|----------------------|
| Frontend | Vercel               |
| Backend  | Render               |
| Database | MongoDB Atlas        |

See `.env.example` and `server/.env.example` for required environment variables.
