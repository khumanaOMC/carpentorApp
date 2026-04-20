const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    workType: { type: String, required: true },
    skillRequirements: [{ type: String }],
    carpenterCountNeeded: { type: Number, default: 1 },
    rateModel: {
      type: String,
      enum: [
        "daily",
        "half_day",
        "full_day",
        "contract",
        "per_project",
        "per_item",
        "per_sqft",
        "monthly"
      ],
      required: true
    },
    budget: {
      min: Number,
      max: Number
    },
    duration: {
      startDate: Date,
      endDate: Date,
      estimatedDays: Number
    },
    labourMode: {
      type: String,
      enum: ["labour_only", "labour_material", "both"],
      default: "both"
    },
    location: {
      state: String,
      district: String,
      city: String,
      pincode: String,
      fullAddress: String
    },
    outstationAllowed: { type: Boolean, default: false },
    emergencyJob: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["open", "in_progress", "filled", "closed", "cancelled"],
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = { Job };
