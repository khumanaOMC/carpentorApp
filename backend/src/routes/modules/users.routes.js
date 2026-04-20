const express = require("express");
const { User } = require("../../models/user.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { CustomerProfile } = require("../../models/customer-profile.model");
const { Booking } = require("../../models/booking.model");
const { requireAuth } = require("../../middleware/require-auth");

const usersRouter = express.Router();

async function getRoleContext(user) {
  if (user.role === "carpenter") {
    const profile = await CarpenterProfile.findOne({ userId: user._id }).lean();
    return { profileKey: "carpenterId", profileId: profile?._id };
  }

  if (user.role === "contractor") {
    const profile = await ContractorProfile.findOne({ userId: user._id }).lean();
    return { profileKey: "contractorId", profileId: profile?._id };
  }

  if (user.role === "customer") {
    const profile = await CustomerProfile.findOne({ userId: user._id }).lean();
    return { profileKey: "customerId", profileId: profile?._id };
  }

  return { profileKey: null, profileId: null };
}

usersRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser.id).lean();

  let profile = null;
  if (user.role === "carpenter") {
    profile = await CarpenterProfile.findOne({ userId: user._id }).lean();
  } else if (user.role === "contractor") {
    profile = await ContractorProfile.findOne({ userId: user._id }).lean();
  } else if (user.role === "customer") {
    profile = await CustomerProfile.findOne({ userId: user._id }).lean();
  }

  res.json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      profileCompleted: user.profileCompleted,
      language: user.language,
      selectedPlan: user.selectedPlan,
      billingCycle: user.billingCycle,
      planStatus: user.planStatus,
      planUpdatedAt: user.planUpdatedAt,
      profile
    }
  });
});

usersRouter.patch("/me", requireAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.authUser.id,
    {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      profileCompleted: true
    },
    { new: true }
  );

  let profile = null;

  if (user.role === "carpenter") {
    profile = await CarpenterProfile.findOneAndUpdate(
      { userId: user._id },
      {
        experienceYears: req.body.experienceYears || 0,
        bio: req.body.bio || "",
        skills: req.body.skills || [],
        availabilityStatus: req.body.availabilityStatus || "available",
        currentLocation: {
          state: req.body.state || "",
          city: req.body.city || "",
          pincode: req.body.pincode || ""
        },
        profilePhotoUrl: req.body.profilePhotoUrl || "",
        portfolioItems: req.body.portfolioItems || [],
        rateCard: {
          daily: req.body.dailyRate || 0,
          halfDay: req.body.halfDayRate || 0,
          oneAndHalfDay: req.body.oneAndHalfDayRate || 0,
          monthly: req.body.monthlyRate || 0,
          overtimePerHour: req.body.overtimeRate || 0
        }
      },
      { new: true, upsert: true }
    ).lean();
  } else if (user.role === "contractor") {
    profile = await ContractorProfile.findOneAndUpdate(
      { userId: user._id },
      {
        profileType: req.body.contractorType || "individual",
        contactPerson: user.fullName,
        bio: req.body.bio || "",
        profilePhotoUrl: req.body.profilePhotoUrl || "",
        businessLocation: {
          state: req.body.state || "",
          city: req.body.city || "",
          pincode: req.body.pincode || "",
          address: req.body.address || ""
        }
      },
      { new: true, upsert: true }
    ).lean();
  } else if (user.role === "customer") {
    profile = await CustomerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        profileType: req.body.customerType || "homeowner",
        bio: req.body.bio || "",
        profilePhotoUrl: req.body.profilePhotoUrl || "",
        address: {
          state: req.body.state || "",
          city: req.body.city || "",
          pincode: req.body.pincode || "",
          fullAddress: req.body.address || ""
        }
      },
      { new: true, upsert: true }
    ).lean();
  }

  res.json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      profileCompleted: user.profileCompleted,
      language: user.language,
      selectedPlan: user.selectedPlan,
      billingCycle: user.billingCycle,
      planStatus: user.planStatus,
      planUpdatedAt: user.planUpdatedAt,
      profile
    }
  });
});

usersRouter.get("/plan", requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser.id).lean();

  res.json({
    plan: {
      selectedPlan: user.selectedPlan || "basic",
      billingCycle: user.billingCycle || "monthly",
      status: user.planStatus || "pending",
      updatedAt: user.planUpdatedAt || user.updatedAt,
      history: (user.planHistory || []).slice(-5).reverse()
    }
  });
});

usersRouter.patch("/plan", requireAuth, async (req, res) => {
  const selectedPlan = ["basic", "standard", "pro"].includes(req.body.selectedPlan)
    ? req.body.selectedPlan
    : "basic";
  const billingCycle = ["monthly", "yearly"].includes(req.body.billingCycle)
    ? req.body.billingCycle
    : "monthly";

  const user = await User.findById(req.authUser.id);

  user.selectedPlan = selectedPlan;
  user.billingCycle = billingCycle;
  user.planStatus = "active";
  user.planUpdatedAt = new Date();
  user.planHistory = [
    ...(user.planHistory || []),
    {
      plan: selectedPlan,
      billingCycle,
      status: "active",
      changedAt: new Date()
    }
  ].slice(-12);

  await user.save();

  res.json({
    plan: {
      selectedPlan: user.selectedPlan,
      billingCycle: user.billingCycle,
      status: user.planStatus,
      updatedAt: user.planUpdatedAt,
      history: (user.planHistory || []).slice(-5).reverse()
    }
  });
});

usersRouter.get("/my-thekedar", requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser.id).lean();
  const context = await getRoleContext(user);

  if (!context.profileId || user.role === "admin") {
    return res.json({ items: [] });
  }

  const bookings = await Booking.find({
    [context.profileKey]: context.profileId,
    status: { $in: ["accepted", "active", "completed"] }
  })
    .populate({ path: "contractorId", populate: { path: "userId" } })
    .lean();

  const seen = new Set();
  const items = bookings
    .map((booking) => booking.contractorId)
    .filter(Boolean)
    .filter((item) => {
      const id = item._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((item) => ({
      id: item._id,
      userId: item.userId?._id,
      name: item.companyName || item.contactPerson || item.userId?.fullName || "Thekedaar",
      city: item.businessLocation?.city || "",
      phone: item.userId?.mobile || "",
      type: item.profileType || "individual"
    }));

  res.json({ items });
});

usersRouter.get("/my-karigar", requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser.id).lean();
  const context = await getRoleContext(user);

  if (!context.profileId || user.role === "admin") {
    return res.json({ items: [] });
  }

  const bookings = await Booking.find({
    [context.profileKey]: context.profileId,
    status: { $in: ["accepted", "active", "completed"] }
  })
    .populate({ path: "carpenterId", populate: { path: "userId" } })
    .lean();

  const seen = new Set();
  const items = bookings
    .map((booking) => booking.carpenterId)
    .filter(Boolean)
    .filter((item) => {
      const id = item._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((item) => ({
      id: item._id,
      userId: item.userId?._id,
      name: item.userId?.fullName || "Karigar",
      city: item.currentLocation?.city || "",
      phone: item.userId?.mobile || "",
      availabilityStatus: item.availabilityStatus || "available",
      skills: item.skills || []
    }));

  res.json({ items });
});

module.exports = { usersRouter };
