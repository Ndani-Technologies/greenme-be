const axios = require("axios");
const User = require("../Models/User");

const login = async () => {
  // res.json(req.user);
};

const loginCallback = async (req, res) => {
  res.json({ user: req.user });
};
const registerCallback = async (req, res) => {
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

// const userUpdate = async (req, res, next) => {

//   User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
//     .then(
//       () => {
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "application/json");
//         res.json({ success: true, message: "User Updated" });
//       },
//       (err) => next(err)
//     )
//     .catch((err) => next(err));
// };

const userUpdate = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  let timezone;
  if (user.country) {
    try {
      const response = await axios.get(
        `https://timezone.abstractapi.com/v1/current_time/?api_key=d74cb0a9bdca4d53b0717d36559bc603&location=${user.country}`
      );
      timezone = response.data.gmt_offset;
    } catch (error) {
      return next(error);
    }
  } else {
    try {
      const response = await axios.get(
        `https://timezone.abstractapi.com/v1/current_time/?api_key=d74cb0a9bdca4d53b0717d36559bc603&location=${req.body.country}`
      );
      timezone = `GMT ${response.data.gmt_offset}`;
    } catch (error) {
      return next(error);
    }
  }
  try {
    await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, timezone } },
      { new: true }
    );
    res.status(200).json({ success: true, message: "User updated" });
  } catch (error) {
    return next(error);
  }
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
  registerCallback,
};
