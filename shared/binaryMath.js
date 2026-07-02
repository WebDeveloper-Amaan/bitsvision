/**
 * shared/binaryMath.js
 * Single source of truth used by both the React frontend (via Vite alias)
 * and the Express backend (direct relative import).
 */

const MAX_SAFE_BIT_LANE = 32;

// ─── Public API ──────────────────────────────────────────────────────────────

export function buildBinaryModel({ value, operation, phase }) {
  if (operation && !operation.error) {
    return buildOperationModel(operation, phase);
  }
  return buildValueModel(value);
}

// ─── Value model (single number) ─────────────────────────────────────────────

function buildValueModel(value) {
  if (Number.isInteger(value) && Number.isFinite(value)) {
    const bitWidth = chooseBitWidth([value]);
    const bits     = toTwosComplement(value, bitWidth);
    const popcount = bits.split("").filter(b => b === "1").length;

    return {
      title: "Decimal becomes binary voltage states",
      summary: `${fmt(value)} is encoded as ${bitWidth} switches. A 1 means high voltage, a 0 means low voltage, and the leftmost bit carries the sign in two's complement.`,
      bitWidth,
      phase: undefined,
      rows: [{ label: "value", bits: group(bits), accent: "cyan" }],
      bitwiseOps: [],
      steps: [
        { label: "Encode",  text: `${fmt(value)} ÷ 2 repeatedly — remainders right-to-left give ${group(bits)}.` },
        { label: "Sign",    text: value < 0 ? `Negative: CPU flips all bits of ${fmt(-value)} then adds 1 to get two's complement.` : `Leading 0 in bit ${bitWidth - 1} means positive. No extra work needed.` },
        { label: "Store",   text: `${popcount} switch${popcount !== 1 ? "es" : ""} turned ON out of ${bitWidth}. CPU reads them right-to-left as powers of 2.` },
      ],
    };
  }
  return buildFloatModel(value);
}

// ─── Operation model ─────────────────────────────────────────────────────────

function buildOperationModel(operation, phase) {
  const { a, b, operator, result } = operation;

  if (![a, b, result].every(n => Number.isInteger(n) && Number.isFinite(n))) {
    return buildFloatOperationModel(operation);
  }

  const bitWidth = chooseBitWidth([a, b, result]);

  const showB   = phase === "ab" || phase === "result" || !phase;
  const showOut = phase === "result" || !phase;

  const rows = [
    { label: "A",                                    bits: group(toTwosComplement(a, bitWidth)),                    accent: "cyan"    },
    ...(showB   ? [{ label: operator === "-" ? "-B" : "B", bits: group(toTwosComplement(operator === "-" ? -b : b, bitWidth)), accent: "fuchsia" }] : []),
    ...(showOut ? [{ label: "OUT",                         bits: group(toTwosComplement(result, bitWidth)),              accent: "emerald" }] : []),
  ];

  return {
    title:      `${operatorName(operator)} in binary, not magic`,
    summary:    `${fmt(a)} ${operator} ${fmt(b)} = ${fmt(result)}. The workbench shows the signed ${bitWidth}-bit lane a CPU-style integer unit would use.`,
    bitWidth,
    operator,
    phase:      phase ?? "result",
    rows,
    bitwiseOps: buildBitwiseOps({ a, b, operator, bitWidth }),
    steps:      buildSteps({ a, b, operator, result, bitWidth }),
  };
}

// ─── Bitwise operations annotation ───────────────────────────────────────────
//
// Each entry: { op, label, color, detail }
//   op     — short symbol shown in the badge  (XOR, AND, NOT, OR, <<, >>)
//   label  — one-line human description
//   color  — tailwind accent key
//   detail — longer tooltip / explanation

function buildBitwiseOps({ a, b, operator, bitWidth }) {
  const bitsA = toTwosComplement(a, bitWidth);
  const bitsB = toTwosComplement(b, bitWidth);

  if (operator === "+") {
    // Full-adder: sum = A XOR B (XOR carry), carry = A AND B
    const xorBits  = group(bitwiseXOR(bitsA, bitsB));
    const andBits  = group(bitwiseAND(bitsA, bitsB));
    return [
      {
        op: "XOR",
        label: "Sum bits  (A XOR B)",
        color: "cyan",
        detail: `Each column: A XOR B gives the raw sum bit before carry.\nA   = ${group(bitsA)}\nB   = ${group(bitsB)}\nXOR = ${xorBits}`,
      },
      {
        op: "AND",
        label: "Carry bits  (A AND B)",
        color: "violet",
        detail: `A AND B finds every column where both bits are 1 — those generate a carry into the next column.\nA   = ${group(bitsA)}\nB   = ${group(bitsB)}\nAND = ${andBits}`,
      },
    ];
  }

  if (operator === "-") {
    // Two's complement of B: NOT B, then +1 (which itself uses XOR/AND carry)
    const notBits = group(bitwiseNOT(bitsB, bitWidth));
    return [
      {
        op: "NOT",
        label: "Invert B  (NOT B)",
        color: "rose",
        detail: `Step 1 of two's complement: flip every bit of B.\nB       = ${group(bitsB)}\nNOT B   = ${notBits}`,
      },
      {
        op: "XOR",
        label: "Add 1 via XOR  (NOT B + 1)",
        color: "cyan",
        detail: `Step 2: adding 1 to NOT B uses the same XOR/carry adder. The result is −B in two's complement, so subtraction becomes addition.`,
      },
      {
        op: "AND",
        label: "Carry propagation  (AND)",
        color: "violet",
        detail: `Carry bits during the +1 step are found with AND, just like regular addition. No separate subtraction circuit exists in the CPU.`,
      },
    ];
  }

  if (operator === "x") {
    // Shift-and-add: for each 1-bit in B, left-shift A; accumulate with OR/XOR
    const oneBitPositions = [];
    const absB = Math.abs(b).toString(2);
    for (let i = 0; i < absB.length; i++) {
      if (absB[i] === "1") oneBitPositions.push(absB.length - 1 - i);
    }
    const shiftList = oneBitPositions.map(p => `A << ${p}`).join(",  ");
    return [
      {
        op: "AND",
        label: "Scan 1-bits in B  (B AND mask)",
        color: "violet",
        detail: `The CPU tests each bit of B with AND against a sliding 1-bit mask to decide whether to include a shifted copy of A.\nB = ${group(bitsB)}\n1-bit positions found: [${oneBitPositions.join(", ")}]`,
      },
      {
        op: "<<",
        label: `Left-shift A for each 1-bit  (${shiftList || "none"})`,
        color: "amber",
        detail: `For every 1-bit found in B, A is shifted left by that bit's position. Shifting left by n = multiplying by 2ⁿ.\nShifts applied: ${shiftList || "none (B = 0)"}`,
      },
      {
        op: "XOR",
        label: "Accumulate partial products  (XOR + carry)",
        color: "cyan",
        detail: `All shifted copies are added together using the XOR/AND carry-adder. Each partial product is OR'd into the accumulator until all copies are consumed.`,
      },
      {
        op: "OR",
        label: "Merge into accumulator  (OR)",
        color: "emerald",
        detail: `The running total is built by OR-ing each new partial product into the accumulator register before the final carry-add pass.`,
      },
    ];
  }

  if (operator === "/") {
    // Non-restoring division: trial subtraction (uses NOT+1 = two's complement), shift quotient
    return [
      {
        op: ">>",
        label: "Right-shift dividend  (A >> n)",
        color: "amber",
        detail: `The CPU shifts the dividend right one bit at a time, examining each chunk to see if the divisor fits. Shifting right by 1 = dividing by 2.`,
      },
      {
        op: "NOT",
        label: "Trial subtraction via NOT  (NOT divisor + 1)",
        color: "rose",
        detail: `Each trial subtraction is done by negating the divisor (NOT + 1) and adding — the same two's complement trick used for subtraction. No separate divide circuit exists.`,
      },
      {
        op: "OR",
        label: "Build quotient bit  (quotient OR 1)",
        color: "emerald",
        detail: `When the divisor fits into the current chunk, the CPU sets the corresponding quotient bit to 1 using OR. When it doesn't fit, the bit stays 0.`,
      },
    ];
  }

  return [];
}

// ─── Step-by-step explanations ───────────────────────────────────────────────

function buildSteps({ a, b, operator, result, bitWidth }) {
  const A      = fmt(a);
  const B      = fmt(b);
  const R      = fmt(result);
  const bitsA  = group(toTwosComplement(a, bitWidth));
  const bitsB  = group(toTwosComplement(b, bitWidth));
  const bitsR  = group(toTwosComplement(result, bitWidth));

  if (operator === "+") return [
    {
      label: "Step 1 — Line them up",
      text:  `Both numbers are written in binary with ${bitWidth} digits each, padded with leading zeros so every column lines up.\n${A} → ${bitsA}\n${B} → ${bitsB}`,
    },
    {
      label: "Step 2 — XOR each column (sum), AND each column (carry)",
      text:  `The CPU adds each column right-to-left.\n• XOR gives the raw sum bit for that column.\n• AND detects where a carry must propagate left.\n1 + 1 = 10 in binary (write 0, carry 1) — same as 9+1=10 in decimal.`,
    },
    {
      label: "Step 3 — The answer",
      text:  `After all columns are processed the result row holds the answer.\n${bitsR} = ${R} ✓`,
    },
  ];

  if (operator === "-") {
    const negB     = fmt(-b);
    const bitsNegB = group(toTwosComplement(-b, bitWidth));
    const notBits  = group(bitwiseNOT(toTwosComplement(b, bitWidth), bitWidth));
    return [
      {
        label: "Step 1 — NOT B  (flip every bit of B)",
        text:  `No subtraction circuit exists. The CPU negates B using two's complement:\n1. Write B in binary:  ${bitsB}\n2. NOT — flip every bit: ${notBits}\n3. Add 1 (XOR/AND carry adder)\nResult: ${negB} = ${bitsNegB}`,
      },
      {
        label: "Step 2 — Add A + (NOT B + 1) via XOR/AND adder",
        text:  `Now the CPU adds ${A} + (${negB}) through the exact same XOR/AND adder used for +. Subtraction becomes addition — no extra hardware needed.\n${bitsA}\n+ ${bitsNegB}`,
      },
      {
        label: "Step 3 — The answer",
        text:  `Any carry past ${bitWidth} bits is dropped. The remaining bits are the answer.\n${bitsR} = ${R} ✓`,
      },
    ];
  }

  if (operator === "x") {
    const absB     = Math.abs(b).toString(2);
    const oneBits  = absB.split("").filter(c => c === "1").length;
    return [
      {
        label: "Step 1 — AND mask scans B for 1-bits",
        text:  `The CPU slides a 1-bit AND mask across B: ${group(Math.abs(b).toString(2).padStart(bitWidth, "0"))}.\nFor every 1-bit found, it left-shifts (<<) A by that bit's position.\n${B} has ${oneBits} one-bit${oneBits !== 1 ? "s" : ""} → ${oneBits} shifted cop${oneBits !== 1 ? "ies" : "y"} of ${A} created.`,
      },
      {
        label: "Step 2 — OR partial products into accumulator, XOR/AND carry-add",
        text:  `Each shifted copy is OR'd into the accumulator register, then the XOR/AND carry-adder sums all partial products. This is called shift-and-add multiplication.`,
      },
      {
        label: "Step 3 — The answer",
        text:  `The accumulated total is the final product.\n${bitsR} = ${R} ✓`,
      },
    ];
  }

  const remainder = a - Math.trunc(a / b) * b;
  return [
    {
      label: "Step 1 — Right-shift (>>) dividend, trial NOT+1 subtraction",
      text:  `Binary long division: the CPU right-shifts (>>) the dividend one bit at a time. For each chunk it tries a trial subtraction — negating the divisor with NOT+1 and adding — to see if it fits.`,
    },
    {
      label: "Step 2 — OR quotient bit, repeat",
      text:  `When the divisor fits, the CPU sets the quotient bit to 1 via OR and subtracts. When it doesn't fit, the bit stays 0. This builds the answer left-to-right, one bit per step.`,
    },
    {
      label: "Step 3 — The answer",
      text:  `${A} ÷ ${B} = ${R}${remainder !== 0 ? ` remainder ${fmt(remainder)} (decimal part discarded in integer division)` : " exactly — no remainder"}.\n${bitsR} = ${R} ✓`,
    },
  ];
}

// ─── Float models ─────────────────────────────────────────────────────────────

function buildFloatOperationModel({ a, b, operator, result }) {
  return {
    title:      "Floating-point calculation path",
    summary:    `${fmt(a)} ${operator} ${fmt(b)} = ${fmt(result)}. Stored as a 64-bit IEEE-754 float.`,
    bitWidth:   64,
    bitwiseOps: [],
    rows:       floatRowsFor(result),
    steps: [
      { label: "Normalize", text: "Decimals are split into sign, exponent, and fraction fields." },
      { label: "Operate",   text: "Exponents are aligned, fractions operated on, result normalized." },
      { label: "Round",     text: "Rounded to the closest 64-bit representable value." },
    ],
  };
}

function buildFloatModel(value) {
  return {
    title:      "IEEE-754 double precision view",
    summary:    `${fmt(value)} is stored in 64 bits as sign, exponent, and fraction.`,
    bitWidth:   64,
    bitwiseOps: [],
    rows:       floatRowsFor(value),
    steps: [
      { label: "Sign",     text: "The first bit stores positive or negative." },
      { label: "Exponent", text: "The next 11 bits store the scale (like scientific notation)." },
      { label: "Fraction", text: "The remaining 52 bits store the precision bits." },
    ],
  };
}

function floatRowsFor(value) {
  const bits = numberToFloat64Bits(value || 0);
  return [
    { label: "sign",     bits: bits.slice(0, 1),        accent: "fuchsia" },
    { label: "exponent", bits: group(bits.slice(1, 12)), accent: "cyan"    },
    { label: "fraction", bits: group(bits.slice(12)),    accent: "emerald" },
  ];
}

function numberToFloat64Bits(value) {
  const buf  = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, value, false);
  let bits = "";
  for (let i = 0; i < 8; i++) bits += view.getUint8(i).toString(2).padStart(8, "0");
  return bits;
}

// ─── Bitwise helpers ──────────────────────────────────────────────────────────

function bitwiseXOR(a, b) {
  return a.split("").map((bit, i) => bit === b[i] ? "0" : "1").join("");
}

function bitwiseAND(a, b) {
  return a.split("").map((bit, i) => bit === "1" && b[i] === "1" ? "1" : "0").join("");
}

function bitwiseNOT(bits, _bitWidth) {
  return bits.split("").map(b => b === "1" ? "0" : "1").join("");
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function chooseBitWidth(values) {
  const largest = Math.max(0, ...values.map(v => Math.abs(Number(v) || 0)));
  if (largest < 128)   return 8;
  if (largest < 32768) return 16;
  return MAX_SAFE_BIT_LANE;
}

function toTwosComplement(value, bitWidth) {
  const lane = 1n << BigInt(bitWidth);
  const mask = lane - 1n;
  let big    = BigInt(value);
  if (big < 0) big = lane + big;
  return (big & mask).toString(2).padStart(bitWidth, "0");
}

function group(bits) {
  return bits.replace(/(.{4})/g, "$1 ").trim();
}

function operatorName(op) {
  return { "+": "Addition", "-": "Subtraction", x: "Multiplication", "/": "Division" }[op] || "Calculation";
}

function fmt(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Error";
  if (!Number.isFinite(value)) return String(value);
  return Number.parseFloat(value.toPrecision(12)).toString();
}
