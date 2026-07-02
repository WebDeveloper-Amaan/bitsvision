import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import CalculatorDisplay from "./CalculatorDisplay.jsx";
import Keypad from "./Keypad.jsx";
import BinaryWorkbench from "./BinaryWorkbench.jsx";
import Header from "./Header.jsx";
import HistoryPanel from "./HistoryPanel.jsx";
import LearnPanel from "./LearnPanel.jsx";
import TourBanner from "./TourBanner.jsx";
import Footer from "./Footer.jsx";
import { buildBinaryModel } from "../lib/binaryMath.js";
import { applyUnary, formatNumber, safeCalculate } from "../lib/calculator.js";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOUR_KEY = "bcc_tour_dismissed";
const DEVICE_KEY = "bcc_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

const deviceId = getDeviceId();
const api = axios.create({ baseURL: API, timeout: 5000, headers: { "x-device-id": deviceId } });

const initialState = {
  display: "0",
  storedValue: null,
  operator: null,
  waitingForOperand: false,
  expression: "Type a number to begin",
  lastOperation: null,
};

export default function CalculatorShell() {
  const [calc, setCalc]               = useState(initialState);
  const [serverModel, setServerModel] = useState(null);
  const [history, setHistory]         = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [learnOpen, setLearnOpen]     = useState(false);
  const [apiOnline, setApiOnline]     = useState(false);
  const [flashKey, setFlashKey]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);
  const [showTour, setShowTour]       = useState(() => !localStorage.getItem(TOUR_KEY));
  const apiOnlineRef = useRef(false);
  const toastTimer   = useRef(null);
  const historyRef   = useRef(null);
  const learnRef     = useRef(null);

  const showToast = useCallback((msg, type = "error") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── Server ── */
  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get("/history");
      setHistory(data);
    } catch {}
  }, []);

  useEffect(() => {
    api.get("/health", { timeout: 2000 })
      .then(() => { setApiOnline(true); apiOnlineRef.current = true; fetchHistory(); })
      .catch(() => { setApiOnline(false); apiOnlineRef.current = false; });
  }, [fetchHistory]);

  const sendToServer = useCallback(async (op) => {
    if (!apiOnlineRef.current) return;
    setSaving(true);
    try {
      const { data } = await api.post("/calculate", { a: op.a, b: op.b, operator: op.operator });
      setServerModel(data.model);
      fetchHistory();
    } catch {
      showToast("Could not save to server — result shown locally.");
    } finally {
      setSaving(false);
    }
  }, [fetchHistory, showToast]);

  /* ── Binary model ── */
  const localModel = useMemo(() => {
    const currentValue = Number(calc.display);

    // If = was already pressed, show the completed result
    if (calc.lastOperation) {
      return buildBinaryModel({
        value: currentValue,
        operation: { ...calc.lastOperation },
        phase: "result",
      });
    }

    // If operator is active and B is being typed — build live in-progress operation
    if (calc.operator && calc.storedValue !== null && !calc.waitingForOperand) {
      const liveResult = safeCalculate(calc.storedValue, currentValue, calc.operator);
      return buildBinaryModel({
        value: currentValue,
        operation: {
          a: calc.storedValue,
          b: currentValue,
          operator: calc.operator,
          result: liveResult.value,
          error: liveResult.error,
        },
        phase: "ab",
      });
    }

    // If operator just pressed, waiting for B — show A row only
    if (calc.operator && calc.storedValue !== null && calc.waitingForOperand) {
      return buildBinaryModel({
        value: calc.storedValue,
        operation: {
          a: calc.storedValue,
          b: 0,
          operator: calc.operator,
          result: calc.storedValue,
          error: null,
        },
        phase: "a",
      });
    }

    // Default — just a single number typed
    return buildBinaryModel({ value: currentValue, operation: null, phase: undefined });
  }, [calc.display, calc.lastOperation, calc.operator, calc.storedValue, calc.waitingForOperand]);

  const binaryModel = serverModel || localModel;

  /* ── Flash ── */
  const flash = useCallback((key) => {
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), 120);
  }, []);

  /* ── Bit flip from workbench ── */
  const handleBitFlip = useCallback((newDecimal) => {
    setServerModel(null);
    const display = formatNumber(newDecimal);
    setCalc((c) => ({
      ...c,
      display,
      expression: `Bit flip → ${display}`,
      waitingForOperand: false,
      lastOperation: null,
    }));
  }, []);

  /* ── Calculator actions ── */
  const inputDigit = useCallback((digit) => {
    setServerModel(null); flash(digit);
    setCalc((c) => {
      if (c.waitingForOperand)
        return { ...c, display: digit, waitingForOperand: false,
          expression: c.operator ? `${formatNumber(c.storedValue)} ${c.operator}` : digit };
      const next = c.display === "0" ? digit : `${c.display}${digit}`;
      return { ...c, display: next, expression: next };
    });
  }, [flash]);

  const inputDecimal = useCallback(() => {
    setServerModel(null); flash(".");
    setCalc((c) => {
      if (c.waitingForOperand) return { ...c, display: "0.", waitingForOperand: false };
      if (c.display.includes(".")) return c;
      return { ...c, display: `${c.display}.`, expression: `${c.display}.` };
    });
  }, [flash]);

  const clear = useCallback(() => { setServerModel(null); flash("AC"); setCalc(initialState); }, [flash]);

  const backspace = useCallback(() => {
    setServerModel(null); flash("DEL");
    setCalc((c) => {
      if (c.waitingForOperand) return c;
      const next = c.display.length > 1 ? c.display.slice(0, -1) : "0";
      return { ...c, display: next, expression: next };
    });
  }, [flash]);

  const toggleSign = useCallback(() => {
    setServerModel(null);
    setCalc((c) => {
      const n = Number(c.display);
      if (Number.isNaN(n) || n === 0) return c;
      const next = formatNumber(n * -1);
      return { ...c, display: next, expression: next };
    });
  }, []);

  const percent = useCallback(() => {
    setServerModel(null); flash("%");
    setCalc((c) => {
      const n = Number(c.display);
      return { ...c, display: formatNumber(n / 100), expression: `${formatNumber(n)} ÷ 100` };
    });
  }, [flash]);

  const unary = useCallback((op) => {
    setServerModel(null); flash(op);
    setCalc((c) => {
      const n = Number(c.display);
      const result = applyUnary(n, op);
      if (result.error) return { ...c, display: result.error, expression: `${op}(${formatNumber(n)}) = Error`, waitingForOperand: true };
      const display = formatNumber(result.value);
      return { ...c, display, expression: `${op}(${formatNumber(n)}) = ${display}`, waitingForOperand: true, lastOperation: null };
    });
  }, [flash]);

  const chooseOperator = useCallback((nextOp) => {
    setServerModel(null); flash(nextOp);
    setCalc((c) => {
      const inputValue = Number(c.display);
      if (c.operator && !c.waitingForOperand && c.storedValue !== null) {
        const result = safeCalculate(c.storedValue, inputValue, c.operator);
        const op = { a: c.storedValue, b: inputValue, operator: c.operator, result: result.value, error: result.error };
        if (!result.error) sendToServer(op);
        return {
          display: formatNumber(result.value), storedValue: result.value,
          operator: nextOp, waitingForOperand: true,
          expression: `${formatNumber(result.value)} ${nextOp}`, lastOperation: op,
        };
      }
      return { ...c, storedValue: inputValue, operator: nextOp, waitingForOperand: true,
        expression: `${formatNumber(inputValue)} ${nextOp}` };
    });
  }, [sendToServer, flash]);

  const calculate = useCallback(() => {
    flash("=");
    setServerModel(null);
    setCalc((c) => {
      if (!c.operator || c.storedValue === null) return c;
      const inputValue = Number(c.display);
      const result = safeCalculate(c.storedValue, inputValue, c.operator);
      const op = { a: c.storedValue, b: inputValue, operator: c.operator, result: result.value, error: result.error };
      if (!result.error) sendToServer(op);
      return {
        display: result.error ? result.error : formatNumber(result.value),
        storedValue: null, operator: null, waitingForOperand: true,
        expression: `${formatNumber(c.storedValue)} ${c.operator} ${formatNumber(inputValue)} =`,
        lastOperation: op,
      };
    });
  }, [sendToServer, flash]);

  const handleKeyPress = useCallback((key) => {
    if (/^\d$/.test(key))                          return inputDigit(key);
    if (key === ".")                                return inputDecimal();
    if (["+", "-", "x", "/"].includes(key))        return chooseOperator(key);
    if (key === "=")                                return calculate();
    if (key === "AC")                               return clear();
    if (key === "DEL")                              return backspace();
    if (key === "+/-")                              return toggleSign();
    if (key === "%")                                return percent();
    if (["√", "x²", "1/x"].includes(key))          return unary(key);
  }, [inputDigit, inputDecimal, chooseOperator, calculate, clear, backspace, toggleSign, percent, unary]);

  /* ── Physical keyboard ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const map = { Enter: "=", "=": "=", Backspace: "DEL", Escape: "AC", "*": "x", ",": "." };
      const key = map[e.key] ?? e.key;
      const valid = /^\d$/.test(key) || ["+","-","x","/","=","AC","DEL",".","√"].includes(key);
      if (valid) { e.preventDefault(); handleKeyPress(key); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKeyPress]);

  /* ── History ── */
  const recallEntry = useCallback((entry) => {
    setServerModel(null);
    setCalc({
      display: formatNumber(entry.result),
      storedValue: null, operator: null, waitingForOperand: true,
      expression: `Recalled: ${entry.expression}`,
      lastOperation: { a: entry.a, b: entry.b, operator: entry.operator, result: entry.result, error: null },
    });
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await api.delete("/history");
      setHistory([]);
    } catch {
      showToast("Failed to clear history.");
    }
  }, [showToast]);

  const deleteEntry = useCallback(async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory((h) => h.filter((e) => e._id !== id));
    } catch {
      showToast("Failed to delete entry.");
    }
  }, [showToast]);

  const dismissTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setShowTour(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040810] text-white">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div className="glow-cyan" />
      <div className="glow-fuchsia" />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xl transition-all ${
          toast.type === "error"
            ? "border-red-400/30 bg-red-950/80 text-red-300"
            : "border-emerald-400/30 bg-emerald-950/80 text-emerald-300"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <Header
          apiOnline={apiOnline}
          saving={saving}
          onHistoryToggle={() => {
            setHistoryOpen(v => {
              const next = !v;
              if (next) setTimeout(() => historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              return next;
            });
            setLearnOpen(false);
          }}
          historyOpen={historyOpen}
          onLearnToggle={() => {
            setLearnOpen(v => {
              const next = !v;
              if (next) setTimeout(() => learnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              return next;
            });
            setHistoryOpen(false);
          }}
          learnOpen={learnOpen}
        />

        {showTour && <TourBanner onDismiss={dismissTour} />}

        <div className="flex flex-1 flex-col gap-5 pt-5 lg:flex-row lg:items-start lg:gap-7">
          {/* Left column */}
          <div className="flex w-full flex-col gap-4 lg:w-[390px] lg:shrink-0">
            <div className="rise-in rounded-2xl border border-white/10 bg-[#07090f] p-4 shadow-xl shadow-black/40">
              <CalculatorDisplay display={calc.display} expression={calc.expression} saving={saving} />
              <Keypad onPress={handleKeyPress} activeOperator={calc.operator} flashKey={flashKey} />
            </div>

            <div ref={historyRef}>
              <HistoryPanel
                open={historyOpen}
                history={history}
                onClear={clearHistory}
                onDelete={deleteEntry}
                onRecall={recallEntry}
                apiOnline={apiOnline}
              />
            </div>

            <div ref={learnRef}>
              <LearnPanel open={learnOpen} />
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-1 rise-in">
            {/* Mobile scroll nudge — only visible on small screens */}
            <div className="mb-3 flex items-center justify-center gap-2 lg:hidden">
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-[10px] uppercase tracking-widest text-slate-600">binary panel below ↓</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <BinaryWorkbench
              model={binaryModel}
              display={calc.display}
              expression={calc.expression}
              onBitFlip={handleBitFlip}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
