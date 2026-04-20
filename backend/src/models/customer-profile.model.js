const mongoose = require("mongoose");

const customerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profileType: {
      type: String,
      enum: ["homeowner", "builder", "shop_owner", "office_owner"],
      default: "homeowner"
    },
    bio: String,
    profilePhotoUrl: String,
    address: {
      state: String,
      district: String,
      city: String,
      pincode: String,
      fullAddress: String
    },
    favoriteCarpenters: [{ type: mongoose.Schema.Types.ObjectId, ref: "CarpenterProfile" }]
  },
  {
    timestamps: true
  }
);

const CustomerProfile = mongoose.model("CustomerProfile", customerProfileSchema);

module.exports = { CustomerProfile };
