# BitsVision — Full Project Documentation

> **Where Every Number Reveals Its Binary Identity**
> A MERN stack application that visualises how a CPU processes numbers in binary — built for students, teachers, and anyone curious about how computers really work under the hood.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why This Project Exists](#2-why-this-project-exists)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Frontend — How It Works](#6-frontend--how-it-works)
7. [Backend — How It Works](#7-backend--how-it-works)
8. [Database Design](#8-database-design)
9. [Core Algorithm — Binary Math Engine](#9-core-algorithm--binary-math-engine)
10. [Key Features Explained](#10-key-features-explained)
11. [Security Measures](#11-security-measures)
12. [Offline Mode](#12-offline-mode)
13. [Per-Device History](#13-per-device-history)
14. [Deployment](#14-deployment)
15. [API Reference](#15-api-reference)
16. [Data Flow Diagram](#16-data-flow-diagram)

---

## 1. Project Overview

BitsVision is a full-stack MERN (MongoDB, Express, React, Node.js) calculator that goes beyond just showing answers. Every time you type a number or perform a calculation, the app shows you:

- The exact binary representation stored in CPU memory (voltage switches)
- How the CPU performs the operation step by step
- The number in all four bases: Decimal, Binary, Hex, Octal
- Properties of the number (how many bits are ON, is it a power of 2, etc.)
- A history of all your calculations, unique to your device

The goal is to make computer science concepts — binary, two's complement, CPU operations — visible and understandable to everyone.

---

## 2. Why This Project Exists

Most calculators just show you the answer. But computers don't think in decimal — they think in binary (1s and 0s). Every number you type, every addition, every subtraction — it all happens as electrical signals (high voltage = 1, low voltage = 0) inside the CPU.

BitsVision makes this invisible process visible. It answers the question: **"What is the computer actually doing when I press 5 + 3 = ?"**

---

## 3. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 19 | UI components and state management |
| Frontend | Vite | 7.3.6 | Build tool and dev server |
| Frontend | Tailwind CSS | 3.x | Styling |
| Frontend | Axios | Latest | HTTP requests to backend |
| Backend | Node.js | 18+ | JavaScript runtime |
| Backend | Express | 4.22.2 | REST API framework |
| Backend | Mongoose | 8.x | MongoDB object modelling |
| Database | MongoDB | Local/Atlas | Persistent calculation history |
| Security | Helmet | 8.x | HTTP security headers |
| Security | express-rate-limit | 8.x | API rate limiting |
| DevOps | Vercel | — | Frontend deployment |
| DevOps | Render | — | Backend deployment |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                       │
│                                                          │
│   React App (Vite)  ←→  localStorage (deviceId, tour)   │
│         │                                                │
│         │  HTTP requests with x-device-id header        │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼ (port 5173 → proxied to 5000 via Vite)
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER (port 5000)             │
│                                                          │
│   Helmet (security headers)                              │
│   CORS (whitelist: localhost:5173, vercel domain)        │
│   Rate Limiter (60 req/min per IP)                       │
│   Routes: /api/calculate, /api/history, /api/health      │
│         │                                                │
│   binaryMath.js (binary model builder)                   │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼ (mongoose ODM)
┌─────────────────────────────────────────────────────────┐
│              MONGODB (port 27017)                        │
│                                                          │
│   Collection: calculations                               │
│   Fields: deviceId, a, b, operator, result,              │
│           expression, bitWidth, isFloat, createdAt       │
└─────────────────────────────────────────────────────────┘
```

**Two-terminal setup for local development:**
- Terminal 1: `cd server && npm run dev` → Express on port 5000
- Terminal 2: `npm run dev` → React/Vite on port 5173

Vite proxies all `/api/*` requests from 5173 → 5000, so no CORS issues in development.

---

## 5. Project Structure

```
mern-binary-process-calculator/
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── CalculatorShell.jsx   # Main app shell — all state lives here
│   │   ├── CalculatorDisplay.jsx # Shows current number and expression
│   │   ├── Keypad.jsx            # Calculator buttons
│   │   ├── BinaryWorkbench.jsx   # The 4-section binary panel
│   │   ├── BitRail.jsx           # Individual bit row visualiser
│   │   ├── LiveConversionBar.jsx # Dec/Bin/Hex/Oct conversion boxes
│   │   ├── HistoryPanel.jsx      # Collapsible history list
│   │   ├── LearnPanel.jsx        # Expandable concept cards
│   │   ├── Header.jsx            # App header with status indicators
│   │   ├── TourBanner.jsx        # First-visit guided tour modal
│   │   └── Footer.jsx            # App footer
│   ├── lib/
│   │   ├── binaryMath.js         # Re-exports from shared module
│   │   └── calculator.js         # safeCalculate, applyUnary, formatNumber
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles + Tailwind
│
├── server/                       # Express backend
│   ├── models/
│   │   └── Calculation.js        # Mongoose schema
│   ├── routes/
│   │   └── calculator.js         # All API route handlers
│   ├── binaryMath.js             # Server-side binary model builder
│   └── index.js                  # Express app setup + MongoDB connect
│
├── shared/
│   └── binaryMath.js             # Shared binary math logic (used by both)
│
├── .env                          # Frontend env vars (VITE_API_URL)
├── server/.env                   # Backend env vars (MONGO_URI, CLIENT_ORIGIN)
├── vite.config.js                # Vite config with /api proxy
├── vercel.json                   # Vercel deployment config
└── render.yaml                   # Render deployment config
```

---

## 6. Frontend — How It Works

### State Management (CalculatorShell.jsx)

All calculator state lives in a single component using React hooks:

```
calc state:
  display          → what's shown on screen ("42")
  storedValue      → first number before operator (42)
  operator         → current operator ("+")
  waitingForOperand → true after operator pressed
  expression       → human-readable expression ("42 +")
  lastOperation    → completed operation object for binary model
```

### The Phase System

The binary panel updates live as you type. Three phases control what's shown:

| Phase | When | What BitRail shows |
|-------|------|--------------------|
| `undefined` | Just typing a number | Single value row |
| `"a"` | Operator pressed, waiting for B | A row only |
| `"ab"` | Typing second number | A row + B row (live) |
| `"result"` | = pressed | A row + operator + B row + = + OUT row |

### Binary Model (localModel useMemo)

Every keypress recalculates the binary model:

```javascript
// Phase "ab" — live preview while typing B
if (calc.operator && calc.storedValue !== null && !calc.waitingForOperand) {
  const liveResult = safeCalculate(calc.storedValue, currentValue, calc.operator);
  return buildBinaryModel({
    operation: { a: storedValue, b: currentValue, operator, result: liveResult },
    phase: "ab"
  });
}
```

The server model overrides the local model only when the server responds — and is cleared on every new `=` press to prevent stale data.

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `CalculatorShell` | All state, all actions, passes props down |
| `BinaryWorkbench` | Renders 4 sections, decides what to show based on phase |
| `BitRail` | Renders one row of bits with power labels, hex, decimal |
| `LiveConversionBar` | Shows Dec/Bin/Hex/Oct, handles clipboard copy |
| `HistoryPanel` | Shows/hides history, recall/delete entries |
| `LearnPanel` | Expandable concept cards (binary, hex, two's complement, etc.) |
| `TourBanner` | Full-screen first-visit modal, 5 steps, localStorage flag |

---

## 7. Backend — How It Works

### Express Setup (index.js)

```
1. Load .env variables
2. Validate MONGO_URI exists (fail fast if missing)
3. Apply Helmet (sets 15+ security HTTP headers)
4. Apply CORS (whitelist from CLIENT_ORIGIN env var, comma-separated)
5. Apply express.json() body parser
6. Mount /api routes
7. Connect to MongoDB
8. Start listening on PORT
```

### Route Handlers (routes/calculator.js)

Every route:
1. Reads `x-device-id` header — rejects with 400 if missing
2. Validates inputs
3. Performs the operation
4. Queries/writes MongoDB filtered by `deviceId`

Rate limiting: 60 requests per minute per IP address.

### Binary Model Builder (binaryMath.js)

The server builds a binary model for every calculation and returns it to the frontend. This model contains:
- `title` — human-readable operation name
- `summary` — one-sentence explanation
- `bitWidth` — 8, 16, or 32 bits (chosen based on number size)
- `rows` — array of bit rows (A, B, OUT or sign/exponent/fraction for floats)
- `steps` — 3-step plain-English CPU explanation
- `operator` and `phase` fields

---

## 8. Database Design

### Collection: `calculations`

| Field | Type | Description |
|-------|------|-------------|
| `deviceId` | String (indexed) | Anonymous device identifier from localStorage |
| `a` | Number | First operand |
| `b` | Number | Second operand |
| `operator` | String (enum) | One of: +, -, x, / |
| `result` | Number | Calculated result |
| `expression` | String | Human-readable e.g. "5 + 3 = 8" |
| `bitWidth` | Number | 8, 16, or 32 |
| `isFloat` | Boolean | True if result is a decimal number |
| `createdAt` | Date | Auto-set by Mongoose timestamps |

### Why `deviceId` is indexed

Every query filters by `deviceId`. Without an index, MongoDB would scan the entire collection for every request. With the index, it jumps directly to that device's records — critical for performance at scale.

---

## 9. Core Algorithm — Binary Math Engine

### Choosing Bit Width

```javascript
function chooseBitWidth(values) {
  const largest = Math.max(...values.map(v => Math.abs(v)));
  if (largest < 128)   return 8;   // fits in 1 byte
  if (largest < 32768) return 16;  // fits in 2 bytes
  return 32;                        // up to ~4 billion
}
```

### Two's Complement Encoding

This is how CPUs store negative numbers. Instead of a minus sign, they use a mathematical trick:

```javascript
function toTwosComplement(value, bitWidth) {
  const lane = 1n << BigInt(bitWidth);  // e.g. 256 for 8-bit
  const mask = lane - 1n;               // e.g. 255 (all 1s)
  let big = BigInt(value);
  if (big < 0) big = lane + big;        // -5 + 256 = 251 = 11111011
  return (big & mask).toString(2).padStart(bitWidth, "0");
}
```

Example: `-5` in 8-bit two's complement = `11111011`

### Float Detection

If any of a, b, or result is not an integer, the engine switches to IEEE-754 float mode, splitting the 64-bit representation into sign (1 bit), exponent (11 bits), and fraction (52 bits).

### Step Generation

Each operator generates 3 plain-English steps with the actual numbers embedded:

- **Addition**: Line up → Add column by column (carry rule) → Read answer
- **Subtraction**: No subtraction circuit exists → Convert B to negative using two's complement → Add instead
- **Multiplication**: Scan B for 1-bits → Make shifted copies of A → Stack and add all copies
- **Division**: Long division in binary → Build quotient bit by bit → Read answer with remainder

---

## 10. Key Features Explained

### Live Bit Updates

Bits update on every single keypress — not just after `=`. This is achieved by the `localModel` useMemo in CalculatorShell which rebuilds the binary model on every state change, passing the current phase to `buildBinaryModel`.

### Interactive Bit Flipping

When viewing a single number (no operation in progress), every bit cell is clickable. Clicking a bit flips it (0→1 or 1→0) and instantly updates the decimal display. This lets users explore how binary encoding works hands-on.

### Offline Mode

The app checks server health on load. If the server is unreachable:
- All calculations happen locally in the browser using the same `binaryMath.js` logic
- History is not saved (no database)
- The header shows "Offline mode" badge
- No errors are shown to the user — it just works

### Per-Device History

On first visit, `crypto.randomUUID()` generates a unique ID stored in `localStorage`. This ID is sent as `x-device-id` header on every API request. The server filters all database queries by this ID, so each device sees only its own history.

### Tour Banner

A full-screen modal overlay appears on first visit only (checked via `localStorage` flag `bcc_tour_dismissed`). It walks through 5 steps explaining the app. Uses a `useIsMobile` hook (breakpoint 1024px) to say "below" on mobile and "on the right" on desktop.

---

## 11. Security Measures

| Measure | Implementation | Purpose |
|---------|---------------|---------|
| Helmet | `app.use(helmet())` | Sets 15+ HTTP security headers (XSS, clickjacking, MIME sniffing) |
| CORS whitelist | `CLIENT_ORIGIN` env var | Only allows requests from known origins |
| Rate limiting | 60 req/min per IP | Prevents API abuse and DoS |
| Input validation | Type checks on a, b, operator | Rejects malformed requests with 400 |
| Finite number check | `Number.isFinite()` | Blocks Infinity/NaN inputs |
| Device scoping | `findOneAndDelete({ _id, deviceId })` | Users cannot delete each other's history |
| Environment variables | `.env` files, never committed | Keeps secrets out of source code |
| `.gitignore` | Ignores node_modules, dist, .env | Prevents sensitive files in git |

---

## 12. Offline Mode

```javascript
// On app load
axios.get(`${API}/health`, { timeout: 2000 })
  .then(() => { setApiOnline(true); fetchHistory(); })
  .catch(() => { setApiOnline(false); });  // silently falls back

// On calculation
const sendToServer = async (op) => {
  if (!apiOnlineRef.current) return;  // skip if offline
  // ... save to server
};
```

The `apiOnlineRef` is a ref (not state) so it can be read inside callbacks without stale closure issues.

---

## 13. Per-Device History

```javascript
// Frontend — generate once, reuse forever
function getDeviceId() {
  let id = localStorage.getItem("bcc_device_id");
  if (!id) {
    id = crypto.randomUUID();  // e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    localStorage.setItem("bcc_device_id", id);
  }
  return id;
}

// Axios instance with header baked in
const api = axios.create({
  baseURL: API,
  headers: { "x-device-id": deviceId }
});
```

```javascript
// Backend — all queries scoped to deviceId
const history = await Calculation.find({ deviceId })
  .sort({ createdAt: -1 })
  .limit(50);
```

---

## 14. Deployment

### Frontend → Vercel

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render

```yaml
# render.yaml
services:
  - type: web
    name: bitsvision-server
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
```

Set environment variables on Render:
- `MONGO_URI` → MongoDB Atlas connection string
- `CLIENT_ORIGIN` → `https://your-app.vercel.app,http://localhost:5173`
- `PORT` → 5000

### Database → MongoDB Atlas

1. Create free cluster at mongodb.com/atlas
2. Whitelist Render's IP (or 0.0.0.0/0 for all)
3. Copy connection string to `MONGO_URI`

---

## 15. API Reference

### Base URL
- Local: `http://localhost:5000/api`
- Production: `https://your-backend.onrender.com/api`

### Headers (required on all requests)
```
x-device-id: <uuid>
Content-Type: application/json
```

---

### GET /health
Check server and database status.

**Response:**
```json
{ "status": "ok", "db": "connected" }
```

---

### POST /calculate
Perform a calculation and save to history.

**Request body:**
```json
{ "a": 10, "b": 5, "operator": "+" }
```

**Operators:** `+`, `-`, `x`, `/`

**Response:**
```json
{
  "result": 15,
  "model": {
    "title": "Addition in binary, not magic",
    "summary": "10 + 5 = 15. The workbench shows the signed 8-bit lane...",
    "bitWidth": 8,
    "operator": "+",
    "phase": "result",
    "rows": [
      { "label": "A",   "bits": "0000 1010", "accent": "cyan" },
      { "label": "B",   "bits": "0000 0101", "accent": "fuchsia" },
      { "label": "OUT", "bits": "0000 1111", "accent": "emerald" }
    ],
    "steps": [
      { "label": "Step 1 — Line them up", "text": "..." },
      { "label": "Step 2 — Add column by column", "text": "..." },
      { "label": "Step 3 — The answer", "text": "..." }
    ]
  },
  "historyId": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

**Error responses:**
```json
{ "error": "a, b (numbers) and operator are required." }   // 400
{ "error": "Cannot divide by 0" }                          // 400
{ "error": "Too many requests — please slow down." }       // 429
```

---

### GET /history
Get last 50 calculations for this device.

**Response:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "a": 10, "b": 5, "operator": "+",
    "result": 15,
    "expression": "10 + 5 = 15",
    "bitWidth": 8,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### DELETE /history
Clear all history for this device.

**Response:**
```json
{ "message": "History cleared." }
```

---

### DELETE /history/:id
Delete a single history entry (only if it belongs to this device).

**Response:**
```json
{ "message": "Entry deleted." }
```

---

## 16. Data Flow Diagram

```
User types "5"
      │
      ▼
inputDigit("5") → setCalc({ display: "5" })
      │
      ▼
localModel useMemo recalculates
      │
      ▼
buildBinaryModel({ value: 5, phase: undefined })
      │
      ▼
BinaryWorkbench renders:
  Section 1: BitRail shows 0000 0101
  Section 2: CPU steps (encode, sign, store)
  Section 3: Base conversion (5, 101, 0x5, 05)
  Section 4: Bit inspector (2 switches ON, 3 bits needed)

User presses "+"
      │
      ▼
chooseOperator("+") → setCalc({ storedValue: 5, operator: "+", waitingForOperand: true })
      │
      ▼
localModel → phase "a" → BitRail shows only A row

User types "3"
      │
      ▼
inputDigit("3") → waitingForOperand: false, display: "3"
      │
      ▼
localModel → phase "ab" → BitRail shows A row + operator + B row (live)

User presses "="
      │
      ├──► setServerModel(null)  [clear stale server model]
      │
      ├──► setCalc({ display: "8", lastOperation: {a:5, b:3, op:"+", result:8} })
      │
      ├──► localModel → phase "result" → shows A + B + OUT rows
      │
      └──► sendToServer({ a:5, b:3, operator:"+" })
                │
                ▼
           POST /api/calculate
           with x-device-id header
                │
                ▼
           Server validates → safeCalc → buildBinaryModel → Calculation.create()
                │
                ▼
           Returns { result, model, historyId }
                │
                ▼
           setServerModel(data.model) → overrides localModel
           fetchHistory() → updates history panel
```

---

*Documentation for BitsVision v1.0.0*
*Stack: MongoDB · Express · React 19 · Node.js · Vite 7 · Tailwind CSS*
