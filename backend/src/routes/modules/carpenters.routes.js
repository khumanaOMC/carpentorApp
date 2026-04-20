const express = require("express");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { User } = require("../../models/user.model");
const { Booking } = require("../../models/booking.model");
const { Review } = require("../../models/review.model");
const { AttendanceLog } = require("../../models/attendance-log.model");
const { requireAuth } = require("../../middleware/require-auth");

const carpentersRouter = express.Router();

function mapCarpenter(item) {
  return {
    id: item._id,
    userId: item.userId?._id,
    fullName: item.userId?.fullName || "Carpenter",
    phone: item.userId?.mobile || "",
    city: item.currentLocation?.city || "Unknown",
    state: item.currentLocation?.state || "",
    pincode: item.currentLocation?.pincode || "",
    skills: item.skills || [],
    availabilityStatus: item.availabilityStatus,
    averageRating: item.averageRating || 0,
    experienceYears: item.experienceYears || 0,
    rateCard: item.rateCard || {},
    kycStatus: item.kycStatus,
    profilePhotoUrl: item.profilePhotoUrl || "",
    portfolioItems: item.portfolioItems || []
  };
}

carpentersRouter.get("/", async (req, res) => {
  const { search, city, pincode, availabilityStatus } = req.query;
  const query = {};

  if (city) {
    query["currentLocation.city"] = new RegExp(city, "i");
  }

  if (pincode) {
    query["currentLocation.pincode"] = String(pincode);
  }

  if (availabilityStatus) {
    query.availabilityStatus = availabilityStatus;
  }

  const items = await CarpenterProfile.find(query).populate("userId").sort({ createdAt: -1 }).lean();
  const filtered = items.filter((item) => {
    if (!search) return true;

    const haystack = `${item.userId?.fullName || ""} ${item.currentLocation?.city || ""} ${(item.skills || []).join(" ")}`;
    return new RegExp(String(search), "i").test(haystack);
  });

  res.json({ items: filtered.map(mapCarpenter) });
});

carpentersRouter.get("/:id", async (req, res) => {
  const item = await CarpenterProfile.findById(req.params.id).populate("userId").lean();
  if (!item) {
    return res.status(404).json({ message: "Carpenter not found" });
  }

  const [bookings, reviews, attendanceLogs] = await Promise.all([
    Booking.find({ carpenterId: item._id })
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean(),
    Review.find({ revieweeUserId: item.userId?._id, moderationStatus: "approved" })
      .populate("reviewerUserId")
      .sort({ createdAt: -1 })
      .lean(),
    AttendanceLog.find({ carpenterId: item._id })
      .populate("bookingId")
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .sort({ date: -1 })
      .lean()
  ]);

  const averageRating =
    reviews.length > 0 ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 0;

  res.json({
    item: {
      ...mapCarpenter(item),
      averageRating,
      totalJobs: bookings.length,
      completedJobs: bookings.filter((booking) => booking.status === "completed").length,
      reviews: reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        reviewerName: review.reviewerUserId?.fullName || "User",
        reviewerRole: review.reviewerRole,
        createdAt: review.createdAt
      })),
      attendanceHistory: attendanceLogs.slice(0, 8).map((log) => {
        const booking = log.bookingId;
        const dailyRate =
          booking?.rateModel === "half_day"
            ? booking?.agreedRate || 0
            : booking?.rateModel === "daily" || booking?.rateModel === "full_day"
              ? booking?.agreedRate || 0
              : booking?.totalEstimatedAmount && booking?.schedule?.startDate && booking?.schedule?.endDate
                ? Math.round(
                    (booking.totalEstimatedAmount || 0) /
                      Math.max(
                        1,
                        Math.ceil(
                          (new Date(booking.schedule.endDate).getTime() - new Date(booking.schedule.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                  )
                : booking?.agreedRate || 0;

        return {
          id: log._id,
          contractorName:
            log.contractorId?.companyName ||
            log.contractorId?.contactPerson ||
            log.contractorId?.userId?.fullName ||
            "Direct booking",
          contractorPhone: log.contractorId?.userId?.mobile || "",
          date: log.date,
          attendanceType: log.attendanceType,
          approvalStatus: log.approvalStatus,
          shiftHours: Number(((log.totalWorkMinutes || 0) / 60).toFixed(1)),
          overtimeHours: Number(((log.overtimeMinutes || 0) / 60).toFixed(1)),
          dailyRate,
          rateModel: booking?.rateModel || "daily"
        };
      })
    }
  });
});

carpentersRouter.get("/me", requireAuth, async (req, res) => {
  const profile = await CarpenterProfile.findOne({ userId: req.authUser.id }).populate("userId").lean();

  if (!profile) {
    return res.status(404).json({ message: "Carpenter profile not found" });
  }

  res.json({ item: mapCarpenter(profile) });
});

carpentersRouter.post("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser.id).lean();

  if (!user || user.role !== "carpenter") {
    return res.status(403).json({ message: "Sirf carpenter profile yahan update ho sakti hai." });
  }

  const item = await CarpenterProfile.findOneAndUpdate(
    { userId: req.authUser.id },
    {
      experienceYears: req.body.experienceYears || 0,
      skills: req.body.skills || [],
      currentLocation: {
        state: req.body.state || "",
        city: req.body.city || "",
        pincode: req.body.pincode || ""
      },
      preferredWorkLocations: req.body.preferredWorkLocations || [],
      availabilityStatus: req.body.availabilityStatus || "available",
      rateCard: req.body.rateCard || {},
      profilePhotoUrl: req.body.profilePhotoUrl || "",
      portfolioItems: req.body.portfolioItems || []
    },
    { new: true, upsert: true }
  ).populate("userId");

  res.status(201).json({ item: mapCarpenter(item.toObject()) });
});

carpentersRouter.patch("/:id/availability", requireAuth, async (req, res) => {
  const item = await CarpenterProfile.findByIdAndUpdate(
    req.params.id,
    { availabilityStatus: req.body.availabilityStatus },
    { new: true }
  )
    .populate("userId")
    .lean();

  if (!item) {
    return res.status(404).json({ message: "Carpenter profile not found" });
  }

  res.json({ item: mapCarpenter(item) });
});

module.exports = { carpentersRouter };
