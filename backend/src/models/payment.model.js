const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    payerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    payeeUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentType: {
      type: String,
      enum: ["advance", "partial", "final", "refund"],
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "cash", "manual"],
      default: "upi"
    },
    gateway: {
      type: String,
      enum: ["razorpay", "cashfree", "manual"],
      default: "manual"
    },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["created", "success", "failed", "under_review"],
      default: "created"
    },
    note: { type: String, default: "" }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
