const { User } = require("../models/user.model");
const { requireAuth } = require("./require-auth");

async function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    const user = await User.findById(req.authUser.id).lean();

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.authUser.role = user.role;
    return next();
  });
}

module.exports = { requireAdmin };
