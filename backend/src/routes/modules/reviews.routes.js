const express = require("express");
const { Review } = require("../../models/review.model");
const { User } = require("../../models/user.model");
const { requireAuth } = require("../../middleware/require-auth");

const reviewsRouter = express.Router();

reviewsRouter.post("/", requireAuth, async (req, res) => {
  const review = await Review.create({
    bookingId: req.body.bookingId,
    reviewerUserId: req.authUser.id,
    revieweeUserId: req.body.revieweeUserId,
    reviewerRole: req.authUser.role,
    rating: req.body.rating,
    title: req.body.title || "",
    comment: req.body.comment || "",
    moderationStatus: "approved"
  });

  res.status(201).json({ item: review });
});

reviewsRouter.get("/user/:userId", async (req, res) => {
  const items = await Review.find({
    revieweeUserId: req.params.userId,
    moderationStatus: "approved"
  })
    .populate("reviewerUserId")
    .sort({ createdAt: -1 })
    .lean();

  const averageRating =
    items.length > 0 ? Number((items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1)) : 0;

  res.json({
    summary: {
      totalReviews: items.length,
      averageRating
    },
    items: items.map((item) => ({
      id: item._id,
      rating: item.rating,
      title: item.title,
      comment: item.comment,
      reviewerName: item.reviewerUserId?.fullName || "User",
      reviewerRole: item.reviewerRole,
      createdAt: item.createdAt
    }))
  });
});

module.exports = { reviewsRouter };
