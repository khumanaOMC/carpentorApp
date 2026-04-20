const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ["direct_booking", "job_hire"],
      required: true
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerProfile" },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "ContractorProfile" },
    carpenterId: { type: mongoose.Schema.Types.ObjectId, ref: "CarpenterProfile", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    bookedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rateModel: { type: String, required: true },
    agreedRate: { type: Number, required: true },
    schedule: {
      startDate: Date,
      endDate: Date
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "active", "completed", "cancelled", "disputed"],
      default: "pending"
    },
    advanceAmount: { type: Number, default: 0 },
    totalEstimatedAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    finalSettlementAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid"
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = { Booking };
