const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    reviewerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    revieweeUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewerRole: { type: String, enum: ["carpenter", "contractor", "customer", "admin"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, trim: true, default: "" },
    comment: { type: String, trim: true, default: "" },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved"
    }
  },
  {
    timestamps: true
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
