import mongoose from "mongoose";

const calculationSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    a: { type: Number, required: true },
    b: { type: Number, required: true },
    operator: { type: String, required: true, enum: ["+", "-", "x", "/"] },
    result: { type: Number, required: true },
    expression: { type: String, required: true },
    bitWidth: { type: Number, required: true },
    isFloat: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Calculation", calculationSchema);
