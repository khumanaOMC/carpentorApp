const express = require("express");
const { requireAuth } = require("../../middleware/require-auth");
const { ChatThread } = require("../../models/chat-thread.model");
const { Booking } = require("../../models/booking.model");
const { User } = require("../../models/user.model");

const chatsRouter = express.Router();

function mapThread(thread, viewerUserId) {
  const otherParticipant = (thread.participantUserIds || []).find(
    (item) => String(item._id || item) !== String(viewerUserId)
  );

  return {
    id: thread._id,
    bookingId: thread.bookingId?._id || thread.bookingId || null,
    participant: otherParticipant
      ? {
          userId: otherParticipant._id || otherParticipant,
          fullName: otherParticipant.fullName || "User",
          mobile: otherParticipant.mobile || ""
        }
      : null,
    messages: (thread.messages || []).map((message) => ({
      id: message._id,
      senderUserId: message.senderUserId?._id || message.senderUserId,
      text: message.text,
      sentAt: message.sentAt
    })),
    lastMessageAt: thread.lastMessageAt
  };
}

chatsRouter.post("/thread", requireAuth, async (req, res) => {
  const participantUserId = req.body.participantUserId;
  const bookingId = req.body.bookingId;

  if (!participantUserId) {
    return res.status(400).json({ message: "participantUserId required hai." });
  }

  const otherUser = await User.findById(participantUserId).lean();
  if (!otherUser) {
    return res.status(404).json({ message: "Chat participant nahi mila." });
  }

  if (bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate({ path: "carpenterId", populate: { path: "userId" } })
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .populate({ path: "customerId", populate: { path: "userId" } })
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking nahi mili." });
    }

    if (!["accepted", "active", "completed"].includes(booking.status)) {
      return res.status(403).json({ message: "Chat sirf accepted booking ke baad open hogi." });
    }

    const allowedUserIds = [
      booking.carpenterId?.userId?._id,
      booking.contractorId?.userId?._id,
      booking.customerId?.userId?._id
    ]
      .filter(Boolean)
      .map((item) => String(item));

    if (!allowedUserIds.includes(String(req.authUser.id)) || !allowedUserIds.includes(String(participantUserId))) {
      return res.status(403).json({ message: "Aap is booking chat ka hissa nahi ho." });
    }
  } else {
    const relatedBookings = await Booking.find({
      status: { $in: ["accepted", "active", "completed"] }
    })
      .populate({ path: "carpenterId", populate: { path: "userId" } })
      .populate({ path: "contractorId", populate: { path: "userId" } })
      .populate({ path: "customerId", populate: { path: "userId" } })
      .lean();

    const canChat = relatedBookings.some((booking) => {
      const allowedUserIds = [
        booking.carpenterId?.userId?._id,
        booking.contractorId?.userId?._id,
        booking.customerId?.userId?._id
      ]
        .filter(Boolean)
        .map((item) => String(item));

      return allowedUserIds.includes(String(req.authUser.id)) && allowedUserIds.includes(String(participantUserId));
    });

    if (!canChat) {
      return res.status(403).json({ message: "Chat sirf accepted connection ke baad open hogi." });
    }
  }

  let thread = await ChatThread.findOne({
    participantUserIds: { $all: [req.authUser.id, participantUserId], $size: 2 },
    ...(bookingId ? { bookingId } : {})
  })
    .populate("participantUserIds")
    .lean();

  if (!thread) {
    const created = await ChatThread.create({
      participantUserIds: [req.authUser.id, participantUserId],
      bookingId: bookingId || undefined,
      messages: [],
      lastMessageAt: new Date()
    });

    thread = await ChatThread.findById(created._id).populate("participantUserIds").lean();
  }

  res.status(201).json({ item: mapThread(thread, req.authUser.id) });
});

chatsRouter.get("/", requireAuth, async (req, res) => {
  const items = await ChatThread.find({ participantUserIds: req.authUser.id })
    .populate("participantUserIds")
    .sort({ lastMessageAt: -1 })
    .lean();

  res.json({ items: items.map((item) => mapThread(item, req.authUser.id)) });
});

chatsRouter.get("/:id", requireAuth, async (req, res) => {
  const thread = await ChatThread.findById(req.params.id).populate("participantUserIds").lean();

  if (!thread || !(thread.participantUserIds || []).some((item) => String(item._id || item) === String(req.authUser.id))) {
    return res.status(404).json({ message: "Chat thread nahi mili." });
  }

  res.json({ item: mapThread(thread, req.authUser.id) });
});

chatsRouter.post("/:id/messages", requireAuth, async (req, res) => {
  const text = String(req.body.text || "").trim();

  if (!text) {
    return res.status(400).json({ message: "Message text required hai." });
  }

  const thread = await ChatThread.findById(req.params.id);
  if (!thread || !(thread.participantUserIds || []).some((item) => String(item) === String(req.authUser.id))) {
    return res.status(404).json({ message: "Chat thread nahi mili." });
  }

  thread.messages.push({
    senderUserId: req.authUser.id,
    text,
    sentAt: new Date()
  });
  thread.lastMessageAt = new Date();
  await thread.save();

  const savedThread = await ChatThread.findById(thread._id).populate("participantUserIds").lean();

  res.status(201).json({ item: mapThread(savedThread, req.authUser.id) });
});

module.exports = { chatsRouter };
