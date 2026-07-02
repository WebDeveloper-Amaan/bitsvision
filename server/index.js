import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import calculatorRoutes from "./routes/calculator.js";

// ── Env validation — fail fast with a clear message ──────────────────────────
if (!process.env.MONGO_URI) {
  console.error("FATAL: MONGO_URI environment variable is not set.");
  console.error("  Local dev  → add it to server/.env");
  console.error("  Production → set it in your hosting provider's env config");
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === "production";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — supports multiple allowed origins (comma-separated in env) ─────────
// Example: CLIENT_ORIGIN=https://myapp.vercel.app,http://localhost:5173
const rawOrigins   = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map(o => o.trim()).filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed`));
  },
  credentials: true,
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// ── Public endpoints ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const states   = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = states[mongoose.connection.readyState] ?? "unknown";
  res.json({ status: "ok", db: dbStatus });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", calculatorRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS:          45000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});
