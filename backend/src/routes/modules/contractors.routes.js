const express = require("express");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { Booking } = require("../../models/booking.model");
const { Payment } = require("../../models/payment.model");
const { Review } = require("../../models/review.model");
const { Job } = require("../../models/job.model");

const contractorsRouter = express.Router();

function mapContractorDirectoryItem(contractor, bookings = [], reviews = []) {
  const averageRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
      : contractor.averageRating || 0;

  return {
    id: contractor._id,
    userId: contractor.userId?._id,
    fullName: contractor.companyName || contractor.contactPerson || contractor.userId?.fullName || "Thekedar",
    city: contractor.businessLocation?.city || "",
    state: contractor.businessLocation?.state || "",
    phone: contractor.userId?.mobile || "",
    type: contractor.profileType || "individual",
    profilePhotoUrl: contractor.profilePhotoUrl || "",
    bio: contractor.bio || "",
    totalJobs: bookings.length,
    completedJobs: bookings.filter((item) => item.status === "completed").length,
    activeJobs: bookings.filter((item) => ["accepted", "active", "pending"].includes(item.status)).length,
    averageRating
  };
}

contractorsRouter.post("/profile", (req, res) => {
  res.status(201).json({ message: "Contractor profile scaffold ready", payload: req.body });
});

contractorsRouter.get("/", async (req, res) => {
  const { search, city } = req.query;
  const query = {};

  if (city) {
    query["businessLocation.city"] = new RegExp(city, "i");
  }

  const contractors = await ContractorProfile.find(query).populate("userId").lean();

  const items = await Promise.all(
    contractors.map(async (contractor) => {
      const [bookings, reviews] = await Promise.all([
        Booking.find({ contractorId: contractor._id }).lean(),
        Review.find({ revieweeUserId: contractor.userId?._id, moderationStatus: "approved" }).lean()
      ]);

      return mapContractorDirectoryItem(contractor, bookings, reviews);
    })
  );

  const filtered = items.filter((item) => {
    if (!search) return true;
    const haystack = `${item.fullName} ${item.city} ${item.type}`;
    return new RegExp(String(search), "i").test(haystack);
  });

  filtered.sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }

    return b.activeJobs - a.activeJobs;
  });

  res.json({ items: filtered });
});

contractorsRouter.get("/:id", async (req, res) => {
  const contractor = await ContractorProfile.findById(req.params.id).populate("userId").lean();
  if (!contractor) {
    return res.status(404).json({ message: "Contractor not found" });
  }

  const [bookings, payments, reviews, activeJobs] = await Promise.all([
    Booking.find({ contractorId: contractor._id })
      .populate({ path: "carpenterId", populate: { path: "userId" } })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean(),
    Payment.find({ payerUserId: contractor.userId?._id, status: "success" }).sort({ createdAt: -1 }).lean(),
    Review.find({ revieweeUserId: contractor.userId?._id, moderationStatus: "approved" })
      .populate("reviewerUserId")
      .sort({ createdAt: -1 })
      .lean(),
    Job.find({ createdByUserId: contractor.userId?._id, status: { $in: ["open", "in_progress"] } })
      .sort({ createdAt: -1 })
      .lean()
  ]);

  const averageRating =
    reviews.length > 0 ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)) : 0;

  res.json({
    item: {
      ...mapContractorDirectoryItem(contractor, bookings, reviews),
      userId: contractor.userId?._id,
      totalPaidAmount: payments.reduce((sum, item) => sum + (item.amount || 0), 0),
      averageRating,
      reviews: reviews.map((item) => ({
        id: item._id,
        rating: item.rating,
        title: item.title,
        comment: item.comment,
        reviewerName: item.reviewerUserId?.fullName || "User",
        reviewerRole: item.reviewerRole,
        createdAt: item.createdAt
      })),
      workHistory: bookings.slice(0, 8).map((item) => ({
        id: item._id,
        carpenterId: item.carpenterId?._id || "",
        carpenterName: item.carpenterId?.userId?.fullName || "Karigar",
        jobTitle: item.jobId?.title || "Direct hire",
        status: item.status,
        rateModel: item.rateModel,
        agreedRate: item.agreedRate,
        createdAt: item.createdAt
      })),
      activeJobsPosted: activeJobs.slice(0, 5).map((job) => ({
        id: job._id,
        title: job.title,
        city: job.location?.city || "",
        carpenterCountNeeded: job.carpenterCountNeeded || 1,
        status: job.status,
        createdAt: job.createdAt
      }))
    }
  });
});

contractorsRouter.get("/:id/jobs", (req, res) => {
  res.json({ contractorId: req.params.id, items: [] });
});

module.exports = { contractorsRouter };
