const User = require("../Models/User");

const login = async () => {
  // res.json(req.user);
};

const loginCallback = async (req, res) => {
  res.json({ user: req.user });
};
const getAllUsers = async (req, res, next) => {
  try {
    User.find()
      .populate("role")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permissions",
        },
      })
      .then(
        (users) => {
          res
            .status(200)
            .json({ success: true, message: "Users found", data: users });
        },
        (err) => next(err)
      );
  } catch (err) {
    next(err);
  }
};
const getUserById = async (req, res, next) => {
  try {
    User.findById(req.params.id)
      .populate("role")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permissions",
        },
      })
      .then(
        (user) => {
          res
            .status(200)
            .json({ success: true, message: "User found", data: user });
        },
        (err) => next(err)
      );
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const user = new User(req.body);

  try {
    User.create(user)
      .then(
        (newUser) => {
          res
            .status(201)
            .json({ success: true, message: "User created", data: newUser });
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

const userUpdate = async (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "User Updated" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

const userDelete = async (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(
      () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "User Deleted" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};

module.exports = {
  login,
  loginCallback,
  getAllUsers,
  getUserById,
  createUser,
  userUpdate,
  userDelete,
};
