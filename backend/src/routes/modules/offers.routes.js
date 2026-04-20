const express = require("express");
const { Offer } = require("../../models/offer.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { Job } = require("../../models/job.model");
const { Booking } = require("../../models/booking.model");
const { requireAuth } = require("../../middleware/require-auth");

const offersRouter = express.Router();

function formatRate(rateModel, offeredRate) {
  if (rateModel === "per_sqft") return `₹${offeredRate}/sq ft`;
  if (rateModel === "half_day") return `₹${offeredRate}/half day`;
  if (rateModel === "monthly") return `₹${offeredRate}/month`;
  if (rateModel === "per_project") return `₹${offeredRate}/project`;
  return `₹${offeredRate}/day`;
}

function mapOffer(item) {
  return {
    id: item._id,
    contractorId: item.contractorId?._id,
    carpenterId: item.carpenterId?._id,
    contractorName:
      item.contractorId?.companyName
      || item.contractorId?.contactPerson
      || item.contractorId?.userId?.fullName
      || "Thekedaar",
    carpenterName: item.carpenterId?.userId?.fullName || "Karigar",
    jobTitle: item.jobId?.title || "Direct work offer",
    city: item.contractorId?.businessLocation?.city || item.jobId?.location?.city || "",
    rateLabel: formatRate(item.rateModel, item.offeredRate),
    paymentTerms: item.paymentTerms,
    durationDays: item.durationDays,
    outstationAllowance: item.outstationAllowance || 0,
    overtimeRate: item.overtimeRate || 0,
    message: item.message || "",
    status: item.status
  };
}

offersRouter.get("/my", requireAuth, async (req, res) => {
  if (req.authUser.role === "carpenter") {
    const carpenter = await CarpenterProfile.findOne({ userId: req.authUser.id }).lean();
    if (!carpenter) return res.json({ items: [] });

    const items = await Offer.find({ carpenterId: carpenter._id })
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .populate({ path: "carpenterId", populate: { path: "userId" } })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items: items.map(mapOffer) });
  }

  if (req.authUser.role === "contractor") {
    const contractor = await ContractorProfile.findOne({ userId: req.authUser.id }).lean();
    if (!contractor) return res.json({ items: [] });

    const items = await Offer.find({ contractorId: contractor._id })
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .populate({ path: "carpenterId", populate: { path: "userId" } })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items: items.map(mapOffer) });
  }

  return res.json({ items: [] });
});

offersRouter.post("/", requireAuth, async (req, res) => {
  if (req.authUser.role !== "contractor" && req.authUser.role !== "admin") {
    return res.status(403).json({ message: "Sirf thekedar offer bhej sakta hai." });
  }

  const contractor =
    req.authUser.role === "contractor"
      ? await ContractorProfile.findOne({ userId: req.authUser.id }).lean()
      : await ContractorProfile.findById(req.body.contractorId).lean();

  if (!contractor) {
    return res.status(404).json({ message: "Contractor profile nahi mili." });
  }

  const carpenter = await CarpenterProfile.findById(req.body.carpenterId).lean();
  if (!carpenter) {
    return res.status(404).json({ message: "Karigar profile nahi mili." });
  }

  const offer = await Offer.create({
    contractorId: contractor._id,
    carpenterId: carpenter._id,
    jobId: req.body.jobId,
    offeredByUserId: req.authUser.id,
    rateModel: req.body.rateModel || "daily",
    offeredRate: req.body.offeredRate || 0,
    paymentTerms: req.body.paymentTerms || "Weekly settlement",
    startDate: req.body.startDate,
    durationDays: req.body.durationDays || 1,
    outstationAllowance: req.body.outstationAllowance || 0,
    overtimeRate: req.body.overtimeRate || 0,
    message: req.body.message || "",
    status: "pending"
  });

  const item = await Offer.findById(offer._id)
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate("jobId")
    .lean();

  res.status(201).json({ item: mapOffer(item) });
});

offersRouter.patch("/:id/respond", requireAuth, async (req, res) => {
  if (req.authUser.role !== "carpenter") {
    return res.status(403).json({ message: "Offer response sirf karigar de sakta hai." });
  }

  const carpenter = await CarpenterProfile.findOne({ userId: req.authUser.id }).lean();
  const offer = await Offer.findById(req.params.id)
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate("jobId");

  if (!offer || !carpenter || offer.carpenterId._id.toString() !== carpenter._id.toString()) {
    return res.status(404).json({ message: "Offer nahi mili." });
  }

  const action = req.body.action === "accept" ? "accepted" : "rejected";
  offer.status = action;
  await offer.save();

  if (action === "accepted") {
    const existingBooking = await Booking.findOne({
      contractorId: offer.contractorId._id,
      carpenterId: offer.carpenterId._id,
      jobId: offer.jobId?._id
    }).lean();

    if (!existingBooking) {
      await Booking.create({
        sourceType: "job_hire",
        contractorId: offer.contractorId._id,
        carpenterId: offer.carpenterId._id,
        jobId: offer.jobId?._id,
        bookedByUserId: offer.contractorId.userId?._id || offer.offeredByUserId,
        rateModel: offer.rateModel,
        agreedRate: offer.offeredRate,
        schedule: {
          startDate: offer.startDate || new Date()
        },
        status: "accepted",
        totalEstimatedAmount: offer.offeredRate * Math.max(1, offer.durationDays || 1),
        pendingAmount: offer.offeredRate * Math.max(1, offer.durationDays || 1),
        paymentStatus: "unpaid"
      });
    }

    await Offer.updateMany(
      {
        _id: { $ne: offer._id },
        carpenterId: offer.carpenterId._id,
        jobId: offer.jobId?._id,
        status: "pending"
      },
      { status: "rejected" }
    );

    if (offer.jobId?._id) {
      await Job.findByIdAndUpdate(offer.jobId._id, { status: "in_progress" });
    }
  }

  const finalItem = await Offer.findById(offer._id)
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .populate("jobId")
    .lean();

  res.json({ item: mapOffer(finalItem) });
});

module.exports = { offersRouter };
