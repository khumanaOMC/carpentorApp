const express = require("express");

const paymentsRouter = express.Router();

paymentsRouter.post("/create-order", (req, res) => {
  res.status(201).json({ message: "Payment order scaffold ready", payload: req.body });
});

paymentsRouter.post("/advance", (req, res) => {
  res.status(201).json({ message: "Advance payment scaffold ready", payload: req.body });
});

paymentsRouter.post("/final-settlement", (req, res) => {
  res.status(201).json({ message: "Final settlement scaffold ready", payload: req.body });
});

paymentsRouter.get("/booking/:bookingId", (req, res) => {
  res.json({ bookingId: req.params.bookingId, items: [] });
});

module.exports = { paymentsRouter };
