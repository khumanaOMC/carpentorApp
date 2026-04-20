const express = require("express");
const { requireAuth } = require("../../middleware/require-auth");

const notificationsRouter = express.Router();

notificationsRouter.get("/", requireAuth, (req, res) => {
  const roleLabel =
    req.authUser.role === "carpenter"
      ? "karigar"
      : req.authUser.role === "contractor"
        ? "thekedar"
        : "account";

  res.json({
    items: [
      {
        id: "notif-1",
        title: "New booking update",
        body: "Aapke ek active kaam ka status update hua hai.",
        isRead: false,
        type: "booking",
        createdAt: new Date().toISOString()
      },
      {
        id: "notif-2",
        title: "Profile reminder",
        body: `Apna ${roleLabel} profile complete karke zyada leads pao.`,
        isRead: false,
        type: "profile",
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: "notif-3",
        title: "Payment insight",
        body: "Pending settlement aur hajri approvals check karo.",
        isRead: true,
        type: "payment",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      }
    ]
  });
});

notificationsRouter.patch("/:id/read", requireAuth, (req, res) => {
  res.json({ id: req.params.id, message: "Notification marked as read", ok: true });
});

module.exports = { notificationsRouter };
