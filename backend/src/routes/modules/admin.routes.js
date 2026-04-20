const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../../models/user.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { CustomerProfile } = require("../../models/customer-profile.model");
const { Booking } = require("../../models/booking.model");
const { Payment } = require("../../models/payment.model");
const { requireAdmin } = require("../../middleware/require-admin");

const adminRouter = express.Router();

adminRouter.use(requireAdmin);

function buildSearchRegex(search) {
  return new RegExp(search, "i");
}

adminRouter.get("/dashboard", async (_req, res) => {
  const [users, pendingKyc, activeBookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    CarpenterProfile.countDocuments({ kycStatus: "pending" }),
    Booking.countDocuments({ status: { $in: ["active", "pending"] } }),
    Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  res.json({
    stats: {
      users,
      pendingKyc,
      activeBookings,
      revenue: revenueAgg[0]?.total ?? 0
    }
  });
});

adminRouter.get("/users", async (req, res) => {
  const { role, status, search } = req.query;
  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: buildSearchRegex(search) },
      { email: buildSearchRegex(search) },
      { mobile: buildSearchRegex(search) }
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  res.json({
    items: users.map((item) => ({
      id: item._id,
      name: item.fullName,
      email: item.email,
      mobile: item.mobile,
      role: item.role,
      status: item.status
    }))
  });
});

adminRouter.post("/users/demo", async (req, res) => {
  const timestamp = Date.now().toString().slice(-5);
  const passwordHash = await bcrypt.hash("Demo@12345", 10);
  const user = await User.create({
    fullName: req.body.fullName || `Demo User ${timestamp}`,
    email: req.body.email || `demo${timestamp}@kaamkacarpenter.com`,
    mobile: req.body.mobile || `90000${timestamp}`,
    passwordHash,
    role: req.body.role || "customer",
    status: "active",
    profileCompleted: true
  });

  res.status(201).json({
    item: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    }
  });
});

adminRouter.patch("/users/:id/status", async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).lean();

  res.json({
    item: {
      id: user._id,
      name: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    }
  });
});

adminRouter.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

adminRouter.get("/kyc", async (req, res) => {
  const { status, search } = req.query;
  const profileQuery = {};
  if (status) profileQuery.kycStatus = status;

  const profiles = await CarpenterProfile.find(profileQuery).populate("userId").lean();
  const filtered = profiles.filter((item) => {
    const user = item.userId;
    if (!search) return true;
    const query = `${user?.fullName ?? ""} ${item.currentLocation?.city ?? ""} ${(item.skills || []).join(" ")}`;
    return buildSearchRegex(search).test(query);
  });

  res.json({
    items: filtered.map((item) => ({
      id: item._id,
      name: item.userId?.fullName,
      city: item.currentLocation?.city ?? "Unknown",
      skill: item.skills?.[0] ?? "General carpentry",
      status:
        item.kycStatus === "approved"
          ? "Approved"
          : item.kycStatus === "rejected"
            ? "Rejected"
            : "Pending review",
      risk: item.kycStatus === "pending" ? "Medium" : item.kycStatus === "rejected" ? "High" : "Low"
    }))
  });
});

adminRouter.patch("/kyc/:id/approve", async (req, res) => {
  const profile = await CarpenterProfile.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "approved" },
    { new: true }
  )
    .populate("userId")
    .lean();

  res.json({
    item: {
      id: profile._id,
      name: profile.userId?.fullName,
      city: profile.currentLocation?.city ?? "Unknown",
      skill: profile.skills?.[0] ?? "General carpentry",
      status: "Approved",
      risk: "Low"
    }
  });
});

adminRouter.patch("/kyc/:id/reject", async (req, res) => {
  const profile = await CarpenterProfile.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "rejected" },
    { new: true }
  )
    .populate("userId")
    .lean();

  res.json({
    item: {
      id: profile._id,
      name: profile.userId?.fullName,
      city: profile.currentLocation?.city ?? "Unknown",
      skill: profile.skills?.[0] ?? "General carpentry",
      status: "Rejected",
      risk: "High"
    }
  });
});

adminRouter.get("/bookings", async (req, res) => {
  const { status, search } = req.query;
  const query = {};
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate("bookedByUserId")
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .lean();

  const filtered = bookings.filter((item) => {
    if (!search) return true;
    const worker = item.carpenterId?.userId?.fullName ?? "";
    const party = item.customerId?.userId?.fullName ?? item.contractorId?.userId?.fullName ?? "";
    const haystack = `${worker} ${party} ${item.rateModel}`;
    return buildSearchRegex(search).test(haystack);
  });

  res.json({
    items: filtered.map((item) => ({
      id: item._id,
      title: `${item.rateModel} booking`,
      city: item.contractorId?.businessLocation?.city ?? item.customerId?.address?.city ?? "Unknown",
      worker: item.carpenterId?.userId?.fullName ?? "Unknown worker",
      status:
        item.status === "pending"
          ? "Pending approval"
          : item.status === "active"
            ? "Active"
            : item.status === "completed"
              ? "Completed"
              : item.status,
      payment:
        item.paymentStatus === "paid"
          ? "Paid"
          : item.pendingAmount > 0
            ? `₹${item.pendingAmount} pending`
            : "Settlement due"
    }))
  });
});

adminRouter.post("/bookings/demo", async (req, res) => {
  const carpenter = await CarpenterProfile.findOne().lean();
  const customer = await CustomerProfile.findOne().lean();
  const contractor = await ContractorProfile.findOne().lean();
  const customerUser = customer ? await CustomerProfile.findById(customer._id).populate("userId").lean() : null;
  const contractorUser = contractor ? await ContractorProfile.findById(contractor._id).populate("userId").lean() : null;

  const booking = await Booking.create({
    sourceType: customer ? "direct_booking" : "job_hire",
    customerId: customer?._id,
    contractorId: contractor?._id,
    carpenterId: carpenter?._id,
    bookedByUserId: customerUser?.userId?._id || contractorUser?.userId?._id,
    rateModel: req.body.rateModel || "full_day",
    agreedRate: req.body.agreedRate || 3200,
    status: "pending",
    pendingAmount: req.body.agreedRate || 3200,
    paymentStatus: "unpaid"
  });

  const fullBooking = await Booking.findById(booking._id)
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate({ path: "customerId", populate: { path: "userId" } })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .lean();

  res.status(201).json({
    item: {
      id: fullBooking._id,
      title: `${fullBooking.rateModel} booking`,
      city: fullBooking.contractorId?.businessLocation?.city ?? fullBooking.customerId?.address?.city ?? "Unknown",
      worker: fullBooking.carpenterId?.userId?.fullName ?? "Unknown worker",
      status: "Pending approval",
      payment: `₹${fullBooking.pendingAmount} pending`
    }
  });
});

adminRouter.patch("/bookings/:id/status", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .lean();

  res.json({
    item: {
      id: booking._id,
      title: `${booking.rateModel} booking`,
      city: "Unknown",
      worker: booking.carpenterId?.userId?.fullName ?? "Unknown worker",
      status:
        booking.status === "pending"
          ? "Pending approval"
          : booking.status === "active"
            ? "Active"
            : booking.status === "completed"
              ? "Completed"
              : booking.status,
      payment:
        booking.paymentStatus === "paid"
          ? "Paid"
          : booking.pendingAmount > 0
            ? `₹${booking.pendingAmount} pending`
            : "Settlement due"
    }
  });
});

adminRouter.delete("/bookings/:id", async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  await Payment.deleteMany({ bookingId: req.params.id });
  res.json({ ok: true });
});

adminRouter.get("/payments", async (req, res) => {
  const { status, search } = req.query;
  const query = {};
  if (status) query.status = status;

  const payments = await Payment.find(query)
    .populate("bookingId")
    .populate("payerUserId")
    .lean();

  const filtered = payments.filter((item) => {
    if (!search) return true;
    const haystack = `${item.paymentType} ${item.payerUserId?.fullName ?? ""} ${item.note ?? ""}`;
    return buildSearchRegex(search).test(haystack);
  });

  res.json({
    items: filtered.map((item) => ({
      id: item._id,
      label: `${item.paymentType} payment`,
      meta: `Booking ${item.bookingId?._id} • ₹${item.amount} • ${item.paymentMethod}`,
      status:
        item.status === "created"
          ? "Action needed"
          : item.status === "success"
            ? "Success"
            : item.status === "under_review"
              ? "Under review"
              : "Failed"
    }))
  });
});

adminRouter.post("/payments/demo", async (req, res) => {
  const booking = await Booking.findOne().lean();
  const payer = await User.findOne({ role: { $in: ["customer", "contractor"] } }).lean();
  const payee = await User.findOne({ role: "carpenter" }).lean();

  const payment = await Payment.create({
    bookingId: booking?._id,
    payerUserId: payer?._id,
    payeeUserId: payee?._id,
    paymentType: req.body.paymentType || "advance",
    paymentMethod: req.body.paymentMethod || "upi",
    gateway: req.body.gateway || "manual",
    amount: req.body.amount || 2500,
    status: "created",
    note: "Demo admin-created payment"
  });

  const fullPayment = await Payment.findById(payment._id).populate("bookingId").lean();

  res.status(201).json({
    item: {
      id: fullPayment._id,
      label: `${fullPayment.paymentType} payment`,
      meta: `Booking ${fullPayment.bookingId?._id} • ₹${fullPayment.amount} • ${fullPayment.paymentMethod}`,
      status: "Action needed"
    }
  });
});

adminRouter.patch("/payments/:id/status", async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  )
    .populate("bookingId")
    .lean();

  res.json({
    item: {
      id: payment._id,
      label: `${payment.paymentType} payment`,
      meta: `Booking ${payment.bookingId?._id} • ₹${payment.amount} • ${payment.paymentMethod}`,
      status:
        payment.status === "created"
          ? "Action needed"
          : payment.status === "success"
            ? "Success"
            : payment.status === "under_review"
              ? "Under review"
              : "Failed"
    }
  });
});

adminRouter.delete("/payments/:id", async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = { adminRouter };
