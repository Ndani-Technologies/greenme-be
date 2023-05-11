const { redisClient } = require("../middleware/redisClient");
const Role = require("../Models/Role");

const getAllRoles = async (req, res, next) => {
  try {
    const cacheKey = "ROLE";
    const cache = await redisClient.get(cacheKey);
    let cacheObj = "";
    let cacheLength = 0;
    if (cache != null) {
      cacheObj = JSON.parse(cache);
      cacheLength = Object.keys(cacheObj).length;
    } else {
      cacheLength = 0;
      cacheObj = "";
    }
    Role.find({})
      .populate("permissions")
      .then(
        (roles) => {
          if (roles === "") {
            res.status(404).json({
              success: false,
              message: "roles not found",
            });
            return;
          }
          if (roles.length > cacheLength) {
            redisClient.set("ROLE", JSON.stringify(roles));
            res.status(200).json({
              success: true,
              message: "roles found",
              data: roles,
            });
          }
          if (roles.length < cacheLength) {
            redisClient.del(cacheKey);
            redisClient.set(cacheKey, JSON.stringify(roles));
            res.status(200).json({
              success: true,
              message: "roles found",
              data: JSON.parse(cache),
            });
          }
          if (roles.length === cacheLength) {
            if (roles.title === cache.title) {
              res.status(200).json({
                success: true,
                message: "Roles found",
                data: JSON.parse(cache),
              });
            } else {
              redisClient.del(cacheKey);
              redisClient.set(cacheKey, JSON.stringify(roles));
              res.status(200).json({
                success: true,
                message: "Roles found",
                data: roles,
              });
            }
          }
        },
        (err) => next(err)
      )
      .catch(() => next(new Error("Can't retrieve all roles")));
  } catch (err) {
    next(new Error("Coudn't retrieve roles"));
  }
};

const createRole = (req, res, next) => {
  const newRole = new Role({
    title: req.body.title,
    permissions: req.body.permissions,
  });
  Role.create(newRole)
    .then(
      (role) => {
        res
          .status(201)
          .json({ success: true, message: "Role created", data: role });
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldnot Create Role")));
};

const updateRole = (req, res, next) => {
  if (req.body.title === "") {
    res.status(404).json({
      success: false,
      message: "title must not be empty",
    });
    return;
  }
  Role.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "role updated" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const deleteRole = async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, message: "role is already deleted" });
  }
  Role.findByIdAndDelete(req.params.id)
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "role deleted" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

module.exports = {
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
};
