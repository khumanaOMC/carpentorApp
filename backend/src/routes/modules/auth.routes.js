const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user.model");
const { CarpenterProfile } = require("../../models/carpenter-profile.model");
const { ContractorProfile } = require("../../models/contractor-profile.model");
const { CustomerProfile } = require("../../models/customer-profile.model");

const authRouter = express.Router();

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    },
    process.env.JWT_ACCESS_SECRET || "kaamkacarpenter-dev-secret",
    { expiresIn: "7d" }
  );
}

function formatUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    profileCompleted: user.profileCompleted,
    language: user.language,
    selectedPlan: user.selectedPlan,
    billingCycle: user.billingCycle,
    planStatus: user.planStatus
  };
}

function getTokenFromHeader(headerValue) {
  if (!headerValue || !headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7);
}

async function createBaseProfileForRole(user, reqBody) {
  if (user.role === "carpenter") {
    await CarpenterProfile.create({
      userId: user._id,
      experienceYears: Number(reqBody.experienceYears || 0),
      skills: Array.isArray(reqBody.skills)
        ? reqBody.skills
        : String(reqBody.skills || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      currentLocation: {
        city: reqBody.city || "",
        state: reqBody.state || "",
        pincode: reqBody.pincode || ""
      },
      availabilityStatus: reqBody.availabilityStatus || "available",
      bio: reqBody.bio || "",
      rateCard: {
        daily: Number(reqBody.dailyRate || 0),
        halfDay: Number(reqBody.halfDayRate || 0),
        oneAndHalfDay: Number(reqBody.oneAndHalfDayRate || 0),
        monthly: Number(reqBody.monthlyRate || 0),
        overtimePerHour: Number(reqBody.overtimeRate || 0)
      }
    });
    return;
  }

  if (user.role === "contractor") {
    await ContractorProfile.create({
      userId: user._id,
      profileType: "individual",
      contactPerson: user.fullName,
      businessLocation: {
        city: reqBody.city || "",
        state: reqBody.state || "",
        pincode: reqBody.pincode || ""
      }
    });
    return;
  }

  if (user.role === "customer") {
    await CustomerProfile.create({
      userId: user._id,
      profileType: "homeowner",
      address: {
        city: reqBody.city || "",
        state: reqBody.state || "",
        pincode: reqBody.pincode || ""
      }
    });
  }
}

authRouter.post("/register", async (req, res) => {
  const { fullName, email, mobile, password, role, language } = req.body;

  if (!fullName || !email || !mobile || !password || !role) {
    return res.status(400).json({ message: "Full name, email, mobile, password aur role required hai." });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existingUser) {
    return res.status(409).json({ message: "Is email se account already bana hua hai." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    mobile: mobile.trim(),
    passwordHash,
    role,
    language: ["hi", "en", "ta", "kn"].includes(language) ? language : "hi",
    selectedPlan: "basic",
    billingCycle: "monthly",
    planStatus: "pending",
    planHistory: [],
    status: "active",
    profileCompleted: false
  });

  await createBaseProfileForRole(user, req.body);

  const token = createAccessToken(user);

  return res.status(201).json({
    token,
    user: formatUser(user)
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email aur password required hai." });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email ya password." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email ya password." });
  }

  if (user.status === "blocked") {
    return res.status(403).json({ message: "Ye account blocked hai. Admin support se contact karo." });
  }

  const token = createAccessToken(user);

  return res.json({
    token,
    user: formatUser(user)
  });
});

authRouter.post("/google", (_req, res) => {
  res.json({ message: "Google login scaffold ready" });
});

authRouter.post("/forgot-password", async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  if (!email) {
    return res.status(400).json({ message: "Email required hai." });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "Agar account exist karega to reset instructions ready mil jayengi." });
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  return res.json({
    message: "Reset link generated",
    resetToken: rawToken,
    resetUrl: `${process.env.CORS_ORIGIN || "http://localhost:3000"}/reset-password?token=${rawToken}`
  });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token aur naya password required hai." });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: "Reset token invalid ya expire ho chuka hai." });
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.status = user.status === "blocked" ? "blocked" : "active";
  await user.save();

  return res.json({ message: "Password successfully reset ho gaya." });
});

authRouter.get("/me", async (req, res) => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "kaamkacarpenter-dev-secret");
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    return res.json({ user: formatUser(user) });
  } catch (_error) {
    return res.status(401).json({ message: "Session expired or invalid" });
  }
});

module.exports = { authRouter };
