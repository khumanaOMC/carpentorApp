const mongoose = require("mongoose");

const contractorProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profileType: {
      type: String,
      enum: ["individual", "company"],
      default: "individual"
    },
    companyName: String,
    gstNumber: String,
    contactPerson: String,
    bio: String,
    profilePhotoUrl: String,
    businessLocation: {
      state: String,
      district: String,
      city: String,
      pincode: String,
      address: String
    },
    averageRating: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const ContractorProfile = mongoose.model("ContractorProfile", contractorProfileSchema);

module.exports = { ContractorProfile };
