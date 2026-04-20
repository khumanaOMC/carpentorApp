const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    sentAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const chatThreadSchema = new mongoose.Schema(
  {
    participantUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    messages: [chatMessageSchema],
    lastMessageAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);

module.exports = { ChatThread };
