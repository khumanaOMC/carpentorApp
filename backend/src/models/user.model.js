const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["carpenter", "contractor", "customer", "admin"],
      required: true
    },
    authProviders: {
      emailPassword: { type: Boolean, default: true },
      googleId: { type: String }
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "active"
    },
    language: {
      type: String,
      enum: ["hi", "en", "ta", "kn"],
      default: "hi"
    },
    selectedPlan: {
      type: String,
      enum: ["basic", "standard", "pro"],
      default: "basic"
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },
    planStatus: {
      type: String,
      enum: ["active", "pending", "cancelled"],
      default: "pending"
    },
    planUpdatedAt: { type: Date },
    planHistory: [
      {
        plan: {
          type: String,
          enum: ["basic", "standard", "pro"]
        },
        billingCycle: {
          type: String,
          enum: ["monthly", "yearly"]
        },
        status: {
          type: String,
          enum: ["active", "pending", "cancelled"]
        },
        changedAt: { type: Date, default: Date.now }
      }
    ],
    profileCompleted: { type: Boolean, default: false },
    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
