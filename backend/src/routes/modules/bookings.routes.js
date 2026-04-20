const express = require("express");
const { Booking } = require("../../models/booking.model");
const { Payment } = require("../../models/payment.model");
const { User } = require("../../models/user.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { CustomerProfile } = require("../../models/customer-profile.model");
const { requireAuth } = require("../../middleware/require-auth");

const bookingsRouter = express.Router();

function valueToId(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  return String(value);
}

async function getRoleContext(userId) {
  const user = await User.findById(userId).lean();

  if (!user) {
    return { user: null, profileKey: null, profileId: null };
  }

  if (user.role === "carpenter") {
    const profile = await CarpenterProfile.findOne({ userId: user._id }).lean();
    return { user, profileKey: "carpenterId", profileId: profile?._id || null };
  }

  if (user.role === "contractor") {
    const profile = await ContractorProfile.findOne({ userId: user._id }).lean();
    return { user, profileKey: "contractorId", profileId: profile?._id || null };
  }

  if (user.role === "customer") {
    const profile = await CustomerProfile.findOne({ userId: user._id }).lean();
    return { user, profileKey: "customerId", profileId: profile?._id || null };
  }

  return { user, profileKey: null, profileId: null };
}

function mapBooking(booking, viewerRole) {
  const carpenterName = booking.carpenterId?.userId?.fullName || "Karigar";
  const contractorName =
    booking.contractorId?.companyName
    || booking.contractorId?.contactPerson
    || booking.contractorId?.userId?.fullName
    || "Thekedaar";
  const customerName = booking.customerId?.userId?.fullName || "Customer";

  const counterparty =
    viewerRole === "carpenter"
      ? booking.contractorId?.userId?._id
        ? {
            userId: booking.contractorId.userId._id,
            name: contractorName,
            role: "contractor"
          }
        : booking.customerId?.userId?._id
          ? {
              userId: booking.customerId.userId._id,
              name: customerName,
              role: "customer"
            }
          : null
      : booking.carpenterId?.userId?._id
        ? {
            userId: booking.carpenterId.userId._id,
            name: carpenterName,
            role: "carpenter"
          }
        : null;

  return {
    id: booking._id,
    title: booking.jobId?.title || `${booking.rateModel} booking`,
    party: counterparty?.name || customerName || contractorName || carpenterName || "Booking party",
    amount:
      booking.paymentStatus === "paid"
        ? "Paid and completed"
        : `₹${booking.pendingAmount || booking.agreedRate} pending`,
    progress:
      booking.status === "completed"
        ? 100
        : booking.status === "active"
          ? 68
          : booking.status === "accepted"
            ? 52
            : 24,
    status:
      booking.status === "accepted" ? "active" : booking.status === "rejected" ? "pending" : booking.status,
    counterparty
  };
}

bookingsRouter.get("/", requireAuth, async (req, res) => {
  const { status } = req.query;
  const { user, profileKey, profileId } = await getRoleContext(req.authUser.id);

  if (!user) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const query = user.role === "admin" ? {} : { [profileKey]: profileId };

  if (user.role !== "admin" && (!profileKey || !profileId)) {
    return res.json({ items: [] });
  }

  if (status) {
    query.status = status === "active" ? { $in: ["active", "accepted"] } : status;
  }

  const bookings = await Booking.find(query)
    .populate({ path: "jobId" })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ items: bookings.map((booking) => mapBooking(booking, user.role)) });
});

bookingsRouter.post("/", requireAuth, async (req, res) => {
  const { user, profileId } = await getRoleContext(req.authUser.id);

  if (!user || !profileId) {
    return res.status(400).json({ message: "Booking ke liye profile complete karo." });
  }

  if (user.role !== "contractor" && user.role !== "customer" && user.role !== "admin") {
    return res.status(403).json({ message: "Sirf thekedar ya customer booking request bhej sakta hai." });
  }

  const duplicateBooking = await Booking.findOne({
    carpenterId: req.body.carpenterId,
    ...(user.role === "contractor" ? { contractorId: profileId } : {}),
    ...(user.role === "customer" ? { customerId: profileId } : {}),
    status: { $in: ["pending", "accepted", "active"] }
  }).lean();

  if (duplicateBooking) {
    return res.status(409).json({ message: "Is karigar ko aapki ek active booking request pehle se pending hai." });
  }

  const booking = await Booking.create({
    sourceType: req.body.sourceType || "direct_booking",
    customerId:
      user.role === "customer"
        ? profileId
        : req.body.customerId || undefined,
    contractorId:
      user.role === "contractor"
        ? profileId
        : req.body.contractorId || undefined,
    carpenterId: req.body.carpenterId,
    jobId: req.body.jobId,
    bookedByUserId: req.authUser.id,
    rateModel: req.body.rateModel || "full_day",
    agreedRate: req.body.agreedRate || 0,
    schedule: req.body.schedule || {},
    status: "pending",
    advanceAmount: req.body.advanceAmount || 0,
    totalEstimatedAmount: req.body.totalEstimatedAmount || req.body.agreedRate || 0,
    pendingAmount: req.body.pendingAmount || req.body.agreedRate || 0,
    paymentStatus: req.body.paymentStatus || "unpaid"
  });

  const fullBooking = await Booking.findById(booking._id)
    .populate({ path: "jobId" })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .lean();

  res.status(201).json({ item: mapBooking(fullBooking, user.role) });
});

bookingsRouter.patch("/:id/status", requireAuth, async (req, res) => {
  const { user, profileKey, profileId } = await getRoleContext(req.authUser.id);

  if (!user) {
    return res.status(401).json({ message: "Invalid session" });
  }

  const booking = await Booking.findById(req.params.id)
    .populate({ path: "jobId" })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .lean();

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (user.role !== "admin") {
    if (!profileKey || !profileId || valueToId(booking[profileKey]) !== String(profileId)) {
      return res.status(403).json({ message: "Aap is booking ko update nahi kar sakte." });
    }
  }

  const nextStatus = req.body.status;

  if (user.role === "carpenter" && !["accepted", "rejected"].includes(nextStatus)) {
    return res.status(403).json({ message: "Karigar sirf accept ya reject kar sakta hai." });
  }

  if ((user.role === "contractor" || user.role === "customer") && !["completed", "cancelled", "active"].includes(nextStatus)) {
    return res.status(403).json({ message: "Is action ki permission nahi hai." });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: nextStatus },
    { new: true }
  )
    .populate({ path: "jobId" })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .lean();

  if (nextStatus === "completed") {
    await Payment.updateMany({ bookingId: booking._id, status: "created" }, { status: "success" });
  }

  res.json({ item: mapBooking(updatedBooking, user.role) });
});

module.exports = { bookingsRouter };
