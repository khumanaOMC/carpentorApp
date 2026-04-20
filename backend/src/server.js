require("dotenv").config();

const { app } = require("./app");
const { connectDatabase } = require("./config/database");
const { ensureSeedData } = require("./data/seed");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDatabase();
  await ensureSeedData();
  app.listen(PORT, () => {
    console.log(`KaamKaCarpenter API running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap API", error);
  process.exit(1);
});
