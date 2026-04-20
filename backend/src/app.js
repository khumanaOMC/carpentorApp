const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiRouter } = require("./routes");

const app = express();

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "http://localhost:3001"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "KaamKaCarpenter API" });
});

app.use("/api/v1", apiRouter);

module.exports = { app };
