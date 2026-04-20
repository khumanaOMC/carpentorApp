const mongoose = require("mongoose");

const carpenterProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String }],
    currentLocation: {
      state: String,
      district: String,
      city: String,
      pincode: String
    },
    preferredWorkLocations: [
      {
        state: String,
        district: String,
        city: String,
        pincode: String
      }
    ],
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "outstation"],
      default: "available"
    },
    rateCard: {
      daily: Number,
      halfDay: Number,
      oneAndHalfDay: Number,
      fullDay: Number,
      perProject: Number,
      perItem: Number,
      perSqft: Number,
      monthly: Number,
      overtimePerHour: Number,
      outstationCharge: Number,
      emergencyCharge: Number
    },
    labourMode: {
      type: String,
      enum: ["labour_only", "labour_material", "both"],
      default: "both"
    },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    profilePhotoUrl: { type: String, default: "" },
    portfolioItems: [
      {
        mediaType: {
          type: String,
          enum: ["image", "video"],
          default: "image"
        },
        url: { type: String, required: true },
        caption: { type: String, default: "" }
      }
    ]
  },
  {
    timestamps: true
  }
);

const CarpenterProfile = mongoose.model("CarpenterProfile", carpenterProfileSchema);

module.exports = { CarpenterProfile };
