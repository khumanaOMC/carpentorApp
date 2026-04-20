const mongoose = require("mongoose");

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kaamkacarpenter";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

module.exports = { connectDatabase };
