const { redisClient } = require("../middleware/redisClient");
const Permissions = require("../Models/Permission");

const getAllPermissions = async (req, res, next) => {
  try {
    const cache = await redisClient.get("PERMISSION");
    if (cache != null) {
      res.status(200).json({
        success: true,
        message: "Permissions retrieved",
        data: JSON.parse(cache),
      });
      return;
    }
    Permissions.find({})
      .then(
        (permisssions) => {
          redisClient.set("PERMISSION", JSON.stringify(permisssions));
          res.status(200).json({
            success: true,
            message: "Permissions retrieved",
            data: permisssions,
          });
        },
        (err) => next(err)
      )
      .catch(() => next(new Error("Couldn't retrieve permission")));
  } catch (err) {
    next(new Error("Permission not retrieved"));
  }
};
const createPermission = (req, res, next) => {
  if (req.body.title === "") {
    res.status(404).json({
      success: false,
      message: "title must not be empty",
    });
    return;
  }
  const newPermission = new Permissions({
    title: req.body.title,
    route: req.body.route,
  });
  Permissions.create(newPermission)
    .then(
      (permission) => {
        res.status(201).json({
          success: true,
          message: "Permission created",
          data: permission,
        });
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldn't Create Permission")));
};

const updatePermission = (req, res, next) => {
  if (req.body.title === "") {
    res.status(404).json({
      success: false,
      message: "title must not be empty",
    });
    return;
  }
  Permissions.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  )
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "Permission updated" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
const deletePermission = async (req, res, next) => {
  const permission = await Permissions.findById(req.params.id);
  if (!permission) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, message: "permission is already deleted" });
  }
  Permissions.findByIdAndDelete(req.params.id)
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "Permission deleted" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
module.exports = {
  getAllPermissions,
  createPermission,
  deletePermission,
  updatePermission,
};
