const express = require("express");

const permissionRouter = express.Router();

const permissionController = require("../Controller/permissionController");

permissionRouter.get("/", permissionController.getAllPermissions);
permissionRouter.post("/", permissionController.createPermission);
permissionRouter.patch("/:id", permissionController.updatePermission);
permissionRouter.delete("/:id", permissionController.deletePermission);

module.exports = permissionRouter;
