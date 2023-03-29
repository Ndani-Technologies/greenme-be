const express = require("express");

const roleRouter = express.Router();

const roleController = require("../Controller/roleController");

roleRouter.get("/", roleController.getAllRoles);
roleRouter.post("/", roleController.createRole);
roleRouter.patch("/:id", roleController.updateRole);
roleRouter.delete("/:id", roleController.deleteRole);

module.exports = roleRouter;
