const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kaamkacarpenter";

  if (!process.env.MONGODB_URI && process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI environment variable is required in production.");
  }

  mongoose.set("strictQuery", true);

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      connectTimeoutMS: 5000,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000
    });
  }

  return connectionPromise;
}

module.exports = { connectDatabase };
