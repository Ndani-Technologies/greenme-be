const Role = require("../Models/Role");

const getAllRoles = (req, res, next) => {
  Role.find({})
    .populate("permissions")
    .then(
      (roles) => {
        res
          .status(200)
          .json({ success: true, message: "Role retrieved", data: roles });
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Can't retrieve all roles")));
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
