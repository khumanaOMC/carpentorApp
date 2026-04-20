const express = require("express");
const { Application } = require("../../models/application.model");
const { User } = require("../../models/user.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { Job } = require("../../models/job.model");
const { Booking } = require("../../models/booking.model");
const { requireAuth } = require("../../middleware/require-auth");

const applicationsRouter = express.Router();

applicationsRouter.post("/", requireAuth, async (req, res) => {
  const { jobId, applicantUserId, proposedRate, coverNote } = req.body;

  if (!jobId || !applicantUserId) {
    return res.status(400).json({ message: "jobId aur applicantUserId required hai." });
  }

  const [job, user, carpenterProfile] = await Promise.all([
    Job.findById(jobId).lean(),
    User.findById(applicantUserId).lean(),
    CarpenterProfile.findOne({ userId: applicantUserId }).lean()
  ]);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!user || user.role !== "carpenter") {
    return res.status(400).json({ message: "Sirf carpenter user job apply kar sakta hai." });
  }

  const existing = await Application.findOne({ jobId, applicantUserId, status: { $ne: "withdrawn" } }).lean();
  if (existing) {
    return res.status(409).json({ message: "Is job par aap already apply kar chuke ho." });
  }

  const application = await Application.create({
    jobId,
    carpenterId: carpenterProfile?._id,
    applicantUserId,
    requestType: "job_application",
    proposedRate,
    coverNote,
    status: "applied"
  });

  return res.status(201).json({
    item: {
      id: application._id,
      status: application.status,
      message: "Application submitted"
    }
  });
});

applicationsRouter.post("/direct", requireAuth, async (req, res) => {
  if (req.authUser.role !== "carpenter") {
    return res.status(403).json({ message: "Sirf karigar thekedar ko request bhej sakta hai." });
  }

  const { contractorId, proposedRate, coverNote } = req.body;

  if (!contractorId) {
    return res.status(400).json({ message: "contractorId required hai." });
  }

  const [contractor, carpenterProfile] = await Promise.all([
    ContractorProfile.findById(contractorId).populate("userId").lean(),
    CarpenterProfile.findOne({ userId: req.authUser.id }).lean()
  ]);

  if (!contractor) {
    return res.status(404).json({ message: "Thekedar nahi mila." });
  }

  if (!carpenterProfile) {
    return res.status(400).json({ message: "Karigar profile complete karo." });
  }

  const existing = await Application.findOne({
    contractorId,
    applicantUserId: req.authUser.id,
    requestType: "contractor_request",
    status: { $in: ["applied", "accepted"] }
  }).lean();

  if (existing) {
    return res.status(409).json({ message: "Is thekedar ko aap already request bhej chuke ho." });
  }

  const application = await Application.create({
    contractorId,
    carpenterId: carpenterProfile._id,
    applicantUserId: req.authUser.id,
    requestType: "contractor_request",
    proposedRate,
    coverNote,
    status: "applied"
  });

  return res.status(201).json({
    item: {
      id: application._id,
      status: application.status,
      message: "Request sent"
    }
  });
});

applicationsRouter.get("/my", requireAuth, async (req, res) => {
  const { applicantUserId } = req.query;
  const query = applicantUserId ? { applicantUserId } : {};

  const items = await Application.find(query)
    .populate("jobId")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    items: items.map((item) => ({
      id: item._id,
      title: item.jobId?.title || "Job application",
      status: item.status,
      proposedRate: item.proposedRate || 0,
      createdAt: item.createdAt
    }))
  });
});

applicationsRouter.get("/incoming", requireAuth, async (req, res) => {
  if (req.authUser.role !== "contractor") {
    return res.json({ items: [] });
  }

  const contractor = await ContractorProfile.findOne({ userId: req.authUser.id }).lean();
  if (!contractor) {
    return res.json({ items: [] });
  }

  const items = await Application.find({
    contractorId: contractor._id,
    requestType: "contractor_request",
    status: "applied"
  })
    .populate("applicantUserId")
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    items: items.map((item) => ({
      id: item._id,
      carpenterId: item.carpenterId?._id || "",
      carpenterUserId: item.applicantUserId?._id || "",
      carpenterName: item.applicantUserId?.fullName || "Karigar",
      phone: item.applicantUserId?.mobile || "",
      city: item.carpenterId?.currentLocation?.city || "",
      skills: item.carpenterId?.skills || [],
      proposedRate: item.proposedRate || 0,
      coverNote: item.coverNote || "",
      status: item.status
    }))
  });
});

applicationsRouter.patch("/:id/status", requireAuth, async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("applicantUserId")
    .populate("contractorId");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (application.requestType === "contractor_request") {
    if (req.authUser.role !== "contractor") {
      return res.status(403).json({ message: "Sirf thekedar request respond kar sakta hai." });
    }

    const contractor = await ContractorProfile.findOne({ userId: req.authUser.id }).lean();
    if (!contractor || String(contractor._id) !== String(application.contractorId?._id || application.contractorId)) {
      return res.status(403).json({ message: "Aap is request ko update nahi kar sakte." });
    }
  }

  application.status = req.body.status;
  await application.save();

  if (application.requestType === "contractor_request" && req.body.status === "accepted") {
    const existingBooking = await Booking.findOne({
      contractorId: application.contractorId?._id || application.contractorId,
      carpenterId: application.carpenterId,
      status: { $in: ["accepted", "active", "completed"] }
    }).lean();

    if (!existingBooking) {
      await Booking.create({
        sourceType: "direct_booking",
        contractorId: application.contractorId?._id || application.contractorId,
        carpenterId: application.carpenterId,
        bookedByUserId: req.authUser.id,
        rateModel: "full_day",
        agreedRate: application.proposedRate || 0,
        status: "accepted",
        totalEstimatedAmount: application.proposedRate || 0,
        pendingAmount: application.proposedRate || 0,
        paymentStatus: "unpaid"
      });
    }
  }

  res.json({
    id: application._id,
    status: application.status
  });
});

module.exports = { applicationsRouter };
