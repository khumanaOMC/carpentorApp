const express = require("express");
const { Job } = require("../../models/job.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");

const jobsRouter = express.Router();

function formatRate(job) {
  const max = job.budget?.max || job.budget?.min || 0;
  if (job.rateModel === "per_sqft") {
    return `₹${max}/sq ft`;
  }
  if (job.rateModel === "half_day") {
    return `₹${max}/half day`;
  }
  if (job.rateModel === "monthly") {
    return `₹${max}/month`;
  }
  if (job.rateModel === "per_project") {
    return `₹${max}/project`;
  }
  return `₹${max}/day`;
}

function mapJob(job, contractorProfile) {
  const postedByName =
    contractorProfile?.companyName ||
    contractorProfile?.contactPerson ||
    contractorProfile?.userId?.fullName ||
    job.createdByUserId?.fullName ||
    "Thekedar";

  return {
    id: job._id,
    title: job.title,
    location: job.location?.fullAddress
      ? `${job.location.city} ${job.location.fullAddress}`
      : job.location?.city || "Unknown",
    city: job.location?.city || "Unknown",
    description: job.description,
    rate: formatRate(job),
    workType: job.workType,
    postedBy: {
      userId: contractorProfile?.userId?._id || job.createdByUserId?._id || "",
      contractorId: contractorProfile?._id || "",
      name: postedByName,
      phone: contractorProfile?.userId?.mobile || job.createdByUserId?.mobile || "",
      city: contractorProfile?.businessLocation?.city || job.location?.city || "Unknown",
      type: contractorProfile?.profileType || "individual"
    },
    tags: [
      `${job.carpenterCountNeeded} carpenters`,
      job.outstationAllowed ? "Outstation ok" : "Local only",
      `${job.duration?.estimatedDays || 1} days`
    ],
    status: job.status === "open" ? "Open" : job.status
  };
}

jobsRouter.get("/", async (req, res) => {
  const { search, city, rateModel } = req.query;
  const query = { status: { $in: ["open", "in_progress"] } };

  if (city) {
    query["location.city"] = new RegExp(city, "i");
  }

  if (rateModel) {
    query.rateModel = rateModel;
  }

  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { "location.city": new RegExp(search, "i") },
      { "location.pincode": new RegExp(search, "i") },
      { skillRequirements: { $elemMatch: { $regex: search, $options: "i" } } }
    ];
  }

  const jobs = await Job.find(query).populate("createdByUserId").sort({ createdAt: -1 }).lean();
  const items = await Promise.all(
    jobs.map(async (job) => {
      const contractorProfile = await ContractorProfile.findOne({ userId: job.createdByUserId?._id })
        .populate("userId")
        .lean();

      return mapJob(job, contractorProfile);
    })
  );

  res.json({ items });
});

jobsRouter.post("/", async (req, res) => {
  const createdByUserId = req.body.createdByUserId;

  if (!createdByUserId || !req.body.title || !req.body.description) {
    return res.status(400).json({ message: "createdByUserId, title aur description required hai." });
  }

  const job = await Job.create({
    createdByUserId,
    title: req.body.title,
    description: req.body.description,
    workType: req.body.workType || "Daily wage",
    skillRequirements: req.body.skillRequirements || [],
    carpenterCountNeeded: req.body.carpenterCountNeeded || 1,
    rateModel: req.body.rateModel || "daily",
    budget: {
      min: req.body.budgetMin || 0,
      max: req.body.budgetMax || 0
    },
    duration: {
      estimatedDays: req.body.estimatedDays || 1
    },
    labourMode: req.body.labourMode || "both",
    location: {
      state: req.body.state || "",
      district: req.body.district || "",
      city: req.body.city || "",
      pincode: req.body.pincode || "",
      fullAddress: req.body.location || ""
    },
    outstationAllowed: Boolean(req.body.outstationAllowed),
    emergencyJob: Boolean(req.body.emergencyJob),
    status: "open"
  });

  const contractorProfile = await ContractorProfile.findOne({ userId: createdByUserId }).populate("userId").lean();
  res.status(201).json({ item: mapJob(job.toObject(), contractorProfile) });
});

jobsRouter.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id).populate("createdByUserId").lean();
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const contractorProfile = await ContractorProfile.findOne({ userId: job.createdByUserId?._id }).populate("userId").lean();
  res.json({ item: mapJob(job, contractorProfile) });
});

module.exports = { jobsRouter };
