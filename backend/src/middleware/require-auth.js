const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

function getTokenFromHeader(headerValue) {
  if (!headerValue || !headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7);
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "kaamkacarpenter-dev-secret");
    const user = await User.findById(payload.userId).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.authUser = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      mobile: user.mobile,
      profileCompleted: user.profileCompleted,
      selectedPlan: user.selectedPlan,
      billingCycle: user.billingCycle,
      planStatus: user.planStatus
    };

    next();
  } catch (_error) {
    return res.status(401).json({ message: "Session expired or invalid" });
  }
}

module.exports = { requireAuth };
