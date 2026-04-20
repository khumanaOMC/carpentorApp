const express = require("express");

const customersRouter = express.Router();

customersRouter.post("/profile", (req, res) => {
  res.status(201).json({ message: "Customer profile scaffold ready", payload: req.body });
});

customersRouter.get("/:id", (req, res) => {
  res.json({ id: req.params.id, role: "customer" });
});

customersRouter.get("/:id/bookings", (req, res) => {
  res.json({ customerId: req.params.id, items: [] });
});

module.exports = { customersRouter };
