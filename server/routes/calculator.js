import { Router } from "express";
import rateLimit from "express-rate-limit";
import Calculation from "../models/Calculation.js";
import { buildBinaryModel } from "../binaryMath.js";

const router = Router();

// ── Rate limiter: max 60 calculations per minute per IP ───────────────────────
const calcLimiter = rateLimit({
  windowMs:         60 * 1000,
  max:              60,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: "Too many requests — please slow down." },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDeviceId(req) {
  const id = req.headers["x-device-id"];
  return typeof id === "string" && id.length > 0 ? id : null;
}

function safeCalc(a, b, operator) {
  if (operator === "+") return { value: a + b, error: null };
  if (operator === "-") return { value: a - b, error: null };
  if (operator === "x") return { value: a * b, error: null };
  if (operator === "/") {
    if (b === 0) return { value: null, error: "Cannot divide by 0" };
    return { value: a / b, error: null };
  }
  return { value: b, error: null };
}

// ── POST /api/calculate ───────────────────────────────────────────────────────
router.post("/calculate", calcLimiter, async (req, res) => {
  const { a, b, operator } = req.body;
  const deviceId = getDeviceId(req);

  if (typeof a !== "number" || typeof b !== "number" || !operator) {
    return res.status(400).json({ error: "a, b (numbers) and operator are required." });
  }

  // Guard against Infinity / NaN / values like 1e308 * 1e308
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return res.status(400).json({ error: "a and b must be finite numbers." });
  }

  if (!deviceId) {
    return res.status(400).json({ error: "x-device-id header is required." });
  }

  const { value, error } = safeCalc(a, b, operator);
  if (error) return res.status(400).json({ error });

  const operation  = { a, b, operator, result: value, error: null };
  const model      = buildBinaryModel({ value, operation });
  const expression = `${a} ${operator} ${b} = ${value}`;

  try {
    const saved = await Calculation.create({
      deviceId, a, b, operator, result: value, expression,
      bitWidth: model.bitWidth, isFloat: model.isFloat ?? false,
    });
    return res.json({ result: value, model, historyId: saved._id });
  } catch {
    return res.json({ result: value, model, historyId: null });
  }
});

// ── GET /api/history ──────────────────────────────────────────────────────────
router.get("/history", async (req, res) => {
  const deviceId = getDeviceId(req);
  if (!deviceId) return res.status(400).json({ error: "x-device-id header is required." });
  try {
    const history = await Calculation.find({ deviceId }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch {
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// ── DELETE /api/history ───────────────────────────────────────────────────────
router.delete("/history", async (req, res) => {
  const deviceId = getDeviceId(req);
  if (!deviceId) return res.status(400).json({ error: "x-device-id header is required." });
  try {
    await Calculation.deleteMany({ deviceId });
    res.json({ message: "History cleared." });
  } catch {
    res.status(500).json({ error: "Failed to clear history." });
  }
});

// ── DELETE /api/history/:id ───────────────────────────────────────────────────
router.delete("/history/:id", async (req, res) => {
  const deviceId = getDeviceId(req);
  if (!deviceId) return res.status(400).json({ error: "x-device-id header is required." });
  try {
    await Calculation.findOneAndDelete({ _id: req.params.id, deviceId });
    res.json({ message: "Entry deleted." });
  } catch {
    res.status(500).json({ error: "Failed to delete entry." });
  }
});

export default router;
