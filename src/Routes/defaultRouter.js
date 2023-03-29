const express = require("express");

const UserRouter = express.Router();

UserRouter.get("/", (req, res) => {
  res.json({ user: req.user });
});

module.exports = UserRouter;
