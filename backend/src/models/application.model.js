const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "ContractorProfile" },
    carpenterId: { type: mongoose.Schema.Types.ObjectId, ref: "CarpenterProfile" },
    applicantUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestType: {
      type: String,
      enum: ["job_application", "contractor_request"],
      default: "job_application"
    },
    proposedRate: { type: Number },
    coverNote: { type: String, trim: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "accepted", "hired", "withdrawn"],
      default: "applied"
    }
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = { Application };
