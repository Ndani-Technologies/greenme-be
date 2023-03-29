const Role = require("../Models/Role");
// const middleware = require("../middleware")
const getAllRoles = (req, res, next) => {
  Role.find({})
    .populate("permissions")
    .then(
      (roles) => {
        res.status(200).json(roles);
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Cannot get all Role")));
};

const createRole = (req, res, next) => {
  const newRole = new Role({
    title: req.body.title,
    permissions: req.body.permissions,
  });
  Role.create(newRole)
    .then(
      (role) => {
        res.status(200).json(role);
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldnot Create Role")));
};

const updateRole = (req, res, next) => {
  Role.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .then(
      (role) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(role);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const deleteRole = (req, res, next) => {
  Role.findByIdAndDelete(req.params.id)
    .then(
      (role) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(role);
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
