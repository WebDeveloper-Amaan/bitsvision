export function safeCalculate(a, b, operator) {
  if (operator === "+") return { value: a + b, error: null };
  if (operator === "-") return { value: a - b, error: null };
  if (operator === "x") return { value: a * b, error: null };
  if (operator === "/") {
    if (b === 0) return { value: NaN, error: "Divide by zero" };
    return { value: a / b, error: null };
  }
  return { value: b, error: null };
}

export function applyUnary(value, op) {
  if (op === "√") {
    if (value < 0) return { value: NaN, error: "√ of negative" };
    return { value: Math.sqrt(value), error: null };
  }
  if (op === "x²") return { value: value * value, error: null };
  if (op === "1/x") {
    if (value === 0) return { value: NaN, error: "Divide by zero" };
    return { value: 1 / value, error: null };
  }
  return { value, error: null };
}

export function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Error";
  if (!Number.isFinite(value)) return value > 0 ? "Infinity" : "-Infinity";
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}
