const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "ContractorProfile", required: true },
    carpenterId: { type: mongoose.Schema.Types.ObjectId, ref: "CarpenterProfile", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    offeredByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rateModel: {
      type: String,
      enum: ["daily", "half_day", "full_day", "contract", "per_project", "per_item", "per_sqft", "monthly"],
      required: true
    },
    offeredRate: { type: Number, required: true },
    paymentTerms: { type: String, default: "Weekly settlement" },
    startDate: { type: Date },
    durationDays: { type: Number, default: 1 },
    outstationAllowance: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = { Offer };
