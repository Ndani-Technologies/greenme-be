// const middleware = require('../middleware')
const Permissions = require("../Models/Permission");

const getAllPermissions = (req, res, next) => {
  Permissions.find({})
    .then(
      (permisssions) => {
        res.status(200).json(permisssions);
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldn't get all Permissions")));
};
const createPermission = (req, res, next) => {
  const newPermission = new Permissions({
    title: req.body.title,
    route: req.body.route,
  });
  Permissions.create(newPermission)
    .then(
      (permisssions) => {
        res.status(200).json(permisssions);
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldn't Create Premission")));
};

const updatePermission = (req, res, next) => {
  Permissions.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  )
    .then(
      (permission) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(permission);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
const deletePermission = (req, res, next) => {
  Permissions.findByIdAndDelete(req.params.id)
    .then(
      (permission) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(permission);
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
