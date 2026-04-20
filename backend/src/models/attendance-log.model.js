const mongoose = require("mongoose");

const attendanceLogSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    carpenterId: { type: mongoose.Schema.Types.ObjectId, ref: "CarpenterProfile", required: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "ContractorProfile" },
    date: { type: Date, required: true },
    attendanceType: {
      type: String,
      enum: ["half_day", "full_day", "absent", "leave"],
      required: true
    },
    checkIn: {
      time: Date,
      lat: Number,
      lng: Number
    },
    checkOut: {
      time: Date,
      lat: Number,
      lng: Number
    },
    totalWorkMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    leaveReason: String,
    notes: String
  },
  {
    timestamps: true
  }
);

const AttendanceLog = mongoose.model("AttendanceLog", attendanceLogSchema);

module.exports = { AttendanceLog };
