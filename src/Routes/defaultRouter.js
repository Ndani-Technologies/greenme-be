const express = require("express");

const UserRouter = express.Router();

UserRouter.get("/", (req, res) => {
  res.json({ user: "hi" });
});

module.exports = UserRouter;
