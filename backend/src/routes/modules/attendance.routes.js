const express = require("express");
const { AttendanceLog } = require("../../models/attendance-log.model");
const { Booking } = require("../../models/booking.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { requireAuth } = require("../../middleware/require-auth");

const attendanceRouter = express.Router();

function formatLog(log) {
  const checkIn = log.checkIn?.time ? new Date(log.checkIn.time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "Check-in pending";
  const checkOut = log.checkOut?.time ? new Date(log.checkOut.time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "Check-out pending";

  return {
    id: log._id,
    worker: log.carpenterId?.userId?.fullName || "Worker",
    shift: `${checkIn} - ${checkOut}`,
    note: `${log.attendanceType.replace("_", " ")} • overtime ${Math.round((log.overtimeMinutes || 0) / 60)} hr`,
    approved: log.approvalStatus === "approved",
    approvalStatus: log.approvalStatus
  };
}

attendanceRouter.post("/check-in", async (req, res) => {
  const { bookingId, carpenterId, contractorId, lat, lng } = req.body;

  if (!bookingId || !carpenterId) {
    return res.status(400).json({ message: "bookingId aur carpenterId required hai." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await AttendanceLog.findOne({
    bookingId,
    carpenterId,
    date: { $gte: today }
  });

  if (!log) {
    log = await AttendanceLog.create({
      bookingId,
      carpenterId,
      contractorId,
      date: new Date(),
      attendanceType: "full_day",
      checkIn: { time: new Date(), lat, lng },
      approvalStatus: "pending",
      notes: "Check-in marked from app"
    });
  } else {
    log.checkIn = { time: new Date(), lat, lng };
    await log.save();
  }

  res.status(201).json({ item: { id: log._id, message: "Check-in marked" } });
});

attendanceRouter.post("/check-out", async (req, res) => {
  const { bookingId, carpenterId, lat, lng } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await AttendanceLog.findOne({
    bookingId,
    carpenterId,
    date: { $gte: today }
  });

  if (!log) {
    return res.status(404).json({ message: "Aaj ka check-in record nahi mila." });
  }

  const checkOutTime = new Date();
  log.checkOut = { time: checkOutTime, lat, lng };
  const totalWorkMinutes = Math.max(
    0,
    Math.round((checkOutTime.getTime() - new Date(log.checkIn?.time || checkOutTime).getTime()) / 60000)
  );
  log.totalWorkMinutes = totalWorkMinutes;
  log.overtimeMinutes = Math.max(0, totalWorkMinutes - 480);
  await log.save();

  res.status(201).json({ item: { id: log._id, message: "Check-out marked" } });
});

attendanceRouter.get("/booking/:bookingId", async (req, res) => {
  const logs = await AttendanceLog.find({ bookingId: req.params.bookingId })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .sort({ date: -1 })
    .lean();

  res.json({ items: logs.map(formatLog) });
});

attendanceRouter.patch("/:id/approve", async (req, res) => {
  const log = await AttendanceLog.findByIdAndUpdate(
    req.params.id,
    {
      approvalStatus: req.body.status || "approved",
      notes: req.body.notes || "Approved by contractor"
    },
    { new: true }
  )
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .lean();

  if (!log) {
    return res.status(404).json({ message: "Attendance log not found" });
  }

  res.json({ item: formatLog(log) });
});

attendanceRouter.get("/summary/:bookingId", async (req, res) => {
  const [logs, booking] = await Promise.all([
    AttendanceLog.find({ bookingId: req.params.bookingId }).lean(),
    Booking.findById(req.params.bookingId).lean()
  ]);

  const approvedDays = logs.filter((item) => item.approvalStatus === "approved").length;
  const overtimeMinutes = logs.reduce((sum, item) => sum + (item.overtimeMinutes || 0), 0);

  res.json({
    bookingId: req.params.bookingId,
    approvedDays,
    overtimeMinutes,
    pendingAmount: booking?.pendingAmount || 0
  });
});

attendanceRouter.get("/my-summary", requireAuth, async (req, res) => {
  if (req.authUser.role !== "carpenter") {
    return res.json({
      summary: {
        totalDays: 0,
        approvedDays: 0,
        overtimeHours: 0,
        pendingApprovals: 0,
        estimatedEarnings: 0
      },
      items: []
    });
  }

  const carpenter = await CarpenterProfile.findOne({ userId: req.authUser.id }).lean();
  if (!carpenter) {
    return res.json({
      summary: {
        totalDays: 0,
        approvedDays: 0,
        overtimeHours: 0,
        pendingApprovals: 0,
        estimatedEarnings: 0
      },
      items: []
    });
  }

  const logs = await AttendanceLog.find({ carpenterId: carpenter._id })
    .populate("bookingId")
    .sort({ date: -1 })
    .lean();

  const approvedDays = logs.filter((item) => item.approvalStatus === "approved").length;
  const pendingApprovals = logs.filter((item) => item.approvalStatus === "pending").length;
  const overtimeMinutes = logs.reduce((sum, item) => sum + (item.overtimeMinutes || 0), 0);

  const estimatedEarnings = logs.reduce((sum, item) => {
    const booking = item.bookingId;
    if (!booking) return sum;

    if (booking.rateModel === "half_day") {
      return sum + Math.round((booking.agreedRate || 0) * 0.5);
    }

    if (booking.rateModel === "per_sqft") {
      return sum + (booking.agreedRate || 0);
    }

    return sum + (booking.agreedRate || 0);
  }, 0);

  res.json({
    summary: {
      totalDays: logs.length,
      approvedDays,
      overtimeHours: Number((overtimeMinutes / 60).toFixed(1)),
      pendingApprovals,
      estimatedEarnings
    },
    items: logs.map((log) => ({
      id: log._id,
      date: log.date,
      attendanceType: log.attendanceType,
      approvalStatus: log.approvalStatus,
      overtimeHours: Number(((log.overtimeMinutes || 0) / 60).toFixed(1)),
      shiftHours: Number(((log.totalWorkMinutes || 0) / 60).toFixed(1))
    }))
  });
});

module.exports = { attendanceRouter };
