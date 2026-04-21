const { app } = require("../backend/src/app");
const { connectDatabase } = require("../backend/src/config/database");
const { ensureSeedData } = require("../backend/src/data/seed");

let bootstrapPromise = null;

async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDatabase();
      await ensureSeedData();
    })();
  }

  return bootstrapPromise;
}

module.exports = async function handler(req, res) {
  try {
    await ensureBootstrap();
    return app(req, res);
  } catch (error) {
    console.error("API bootstrap failed", error);
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "API bootstrap failed"
    });
  }
};
