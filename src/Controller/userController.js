const axios = require("axios");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("../Models/User");
const env = require("../configs");
const { redisClient } = require("../middleware/redisClient");

const cacheKey = "USERS";

const loginCallback = async (req, res) => {
  const userLogin = "";
  const user = await User.findById(req.user._id)
    .populate("role")
    .populate({
      path: "role",
      populate: {
        path: "permissions",
        model: "Permissions",
      },
    });
  session.userLogin = user;
  const message = { msg: "ssoComplete" };
  const serializeMsg = JSON.stringify(user);
  const script = `window.opener.postMessage( ${serializeMsg} , '*');`;
  res.send(`<body><script>${script};</script></body>`);
};
const getLoggedInUser = async (req, res, next) => {
  try {
    const userlogged = session.userLogin;
    User.findById(userlogged.id)
      .populate("role")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          model: "Permissions",
        },
      })
      .then((user) => {
        if (user.role === "user") {
          res.json({
            success: true,
            status: 200,
            message: " simple user found",
          });
        }
        res.json({ data: user });
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};
const getUserByOrganization = async (req, res) => {
  try {
    const query = new RegExp(req.params.organization, "i");
    const user = await User.find({
      organization: { $regex: query },
    });
    if (user) {
      res.status(200).json({
        message: "user retrieved by organization",
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({
        message: "user not found by organization",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
const logoutUser = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((error) => {
      if (err) {
        res.status(404).json({ error: "Failed to logout" });
        return;
      }
      // Redirect to the login page or send a success response
      res.json({ status: 200, message: "Logout successful" });
    });
    // res.redirect("/");
  });
  // req.logout();
  // req.session.destroy((err) => {
  //   if (err) {
  //     res.status(404).json({ error: "Failed to logout" });
  //     return;
  //   }
  //   // Redirect to the login page or send a success response
  //   res.json({ status: 200, message: "Logout successful" });
  // }
  // );
};
const registerCallback = async (req, res) => {
  res.json({ user: req.user });
};
const getAllUsers = async (req, res, next) => {
  let cache = await redisClient.get(cacheKey);
  let cacheObj = "";
  let cacheLength = 0;
  if (cache != null) {
    cacheObj = JSON.parse(cache);
    cacheLength = Object.keys(cacheObj).length;
  } else {
    cacheLength = 0;
    cacheObj = "";
  }
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
      .then(async (users) => {
        if (users === "") {
          res.status(404).json({
            success: false,
            message: "users not found",
          });
          return;
        }
        if (users.length > cacheLength) {
          await redisClient.set(cacheKey, JSON.stringify(users));
          res.status(200).json({
            success: true,
            message: "Users found",
            data: users,
          });
        }
        if (users.length <= cacheLength) {
          await redisClient.del(cacheKey);
          await redisClient.set(cacheKey, JSON.stringify(users));
          cache = await redisClient.get(cacheKey);
          res.status(200).json({
            success: true,
            message: "Users found",
            data: JSON.parse(cache),
          });
        }
      });
  } catch (err) {
    next(err);
  }
};
const getUserById = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
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
  const { email } = req.body;
  const isUserExist = await User.find({ email });
  if (isUserExist && isUserExist.length > 0) {
    res.status(404).json({ success: false, message: "User Already Exist" });
    return;
  }
  const user = new User(req.body);
  User.create(user)
    .then(
      (newUser) => {
        res
          .status(200)
          .json({ success: true, message: "User created", data: newUser });
      },
      (err) => {
        console.log("errr2", err);

        next(err);
      }
    )
    .catch((err) => {
      console.log("errr", err);
      next(err);
    });
};

const userUpdate = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  const user = await User.findById(req.params.id);
  if (user.email === "" || req.body.email === "") {
    return res.status(404).json({
      success: false,
      message: "email is required attribute",
    });
  }

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { body } = req;
  if (body.timezone) {
    if (user.country) {
      try {
        const response = await axios.get(
          `https://timezone.abstractapi.com/v1/current_time/?api_key=${env.timezoneKey}=${user.country}`
        );
        body.timezone = response.data.gmt_offset;
      } catch (error) {
        return next(error);
      }
    } else {
      try {
        const response = await axios.get(
          `https://timezone.abstractapi.com/v1/current_time/?api_key=${env.timezoneKey}=${req.body.country}`
        );
        body.timezone = `GMT ${response.data.gmt_offset}`;
      } catch (error) {
        return next(error);
      }
    }
  }

  user.set(body);

  user
    .save()
    .then(async () => {
      await redisClient.del(cacheKey);
      const allUsers = await User.find()
        .populate("role")
        .populate({
          path: "role",
          populate: {
            path: "permissions",
            model: "Permissions",
          },
        });
      await redisClient.set(cacheKey, JSON.stringify(allUsers));
      res.status(200).json({ success: true, message: "User updated" });
    })
    .catch((err) => next(err));
};

const userDelete = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: false, message: "User Doesn't exist" });
  }
  User.findByIdAndDelete(req.params.id)
    .then(
      async () => {
        redisClient.del(cacheKey);
        const allUsers = await User.find()
          .populate("role")
          .populate({
            path: "role",
            populate: {
              path: "permissions",
              model: "Permissions",
            },
          });
        await redisClient.set(cacheKey, JSON.stringify(allUsers));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "User Deleted" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
const userTwoCompare = async (req, res, next) => {
  try {
    const userId1 = req.params.id1;
    const userId2 = req.params.id2;
    const users = await User.find({ _id: { $in: [userId1, userId2] } });
    res.status(200).json({
      success: true,
      message: "Comparison successful",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
const userThreeCompare = async (req, res, next) => {
  try {
    const userId1 = req.params.id1;
    const userId2 = req.params.id2;
    const userId3 = req.params.id3;
    const users = await User.find({
      _id: { $in: [userId1, userId2, userId3] },
    });
    res.status(200).json({
      success: true,
      message: "Comparison successful",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
const userFourCompare = async (req, res, next) => {
  try {
    const userId1 = req.params.id1;
    const userId2 = req.params.id2;
    const userId3 = req.params.id3;
    const userId4 = req.params.id4;
    const users = await User.find({
      _id: { $in: [userId1, userId2, userId3, userId4] },
    });
    res.status(200).json({
      success: true,
      message: "Comparison successful",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
const createBenchmark = async (req, res, next) => {
  try {
    const loggedUserId = session.userLogin.id;
    const benchmark = {
      title: req.body.title,
      country: req.body.country,
      userId: loggedUserId,
    };
    const response = await axios.post("http://localhost:5001/benchmarking", {
      title: benchmark.title,
      country: benchmark.country,
      userId: benchmark.userId,
    });
    if (response) {
      res.json(response.data);
    }
  } catch (error) {
    next(error);
  }
};
const createCategory = async (req, res, next) => {
  try {
    const { titleEng, titleAr, titleFr, titleSp, language } = req.body;
    const cat = {
      language: req.body.language,
      titleEng: "",
      titleFr: "",
      titleSp: "",
      titleAr: "",
    };
    if (cat.language) {
      if (titleEng) {
        cat.titleEng = titleEng;
        cat.titleAr = "";
        cat.titleFr = "";
        cat.titleSp = "";
      }
      if (titleAr) {
        cat.titleAr = titleAr;
        cat.titleFr = "";
        cat.titleSp = "";
        cat.titleEng = "";
      }
      if (titleFr) {
        cat.titleFr = titleFr;
        cat.titleAr = "";
        cat.titleSp = "";
        cat.titleEng = "";
      }
      if (titleSp) {
        cat.titleSp = titleSp;
        cat.titleFr = "";
        cat.titleAr = "";
        cat.titleEng = "";
      }
      cat.language = language;
    } else {
      cat.titleEng = titleEng;
      cat.language = "English";
    }
    const response = await axios.post("http://localhost:5001/category", {
      language: cat.language,
      titleEng: cat.titleEng,
      titleAr: cat.titleAr,
      titleFr: cat.titleFr,
      titleSp: cat.titleSp,
    });
    if (response) {
      res.json(response.data);
    }
  } catch (error) {
    next(error);
  }
};
const createAnswerByUser = async (req, res, next) => {
  const { answerOption, includeExplanation, language } = req.body;
  try {
    let answer;
    if (language) {
      answer = await axios.post("http://localhost:5001/answer", {
        answerOption,
        includeExplanation,
        language,
      });
    } else {
      answer = await axios.post("http://localhost:5001/answer", {
        answerOption,
        includeExplanation,
      });
    }
    res.json(answer.data);
  } catch (error) {
    next(error);
  }
};
const createAnswer = async (req, res, next) => {
  const { answerOption, includeExplanation, language } = req.body;
  try {
    let answer;
    if (language) {
      answer = await axios.post("http://localhost:5001/answer", {
        answerOption,
        includeExplanation,
        language,
      });
    } else {
      answer = await axios.post("http://localhost:5001/answer", {
        answerOption,
        includeExplanation,
      });
    }
    res.json(answer.data);
  } catch (error) {
    next(error);
  }
};
const createQuestions = async (req, res, next) => {
  const questionnaire = {
    status: req.body.status,
    visible: req.body.visible,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    answerOption: req.body.answerOption,
  };
  try {
    const response = await axios.post("http://localhost:5001/questionnaire", {
      status: questionnaire.status,
      visible: questionnaire.visible,
      title: questionnaire.title,
      description: questionnaire.description,
      category: questionnaire.category,
      answerOption: questionnaire.answerOption,
    });
    res.json(response.data);
  } catch (err) {
    next(err);
  }
};
const getAllBenchmarks = async (req, res, next) => {
  try {
    const response = await axios.get("http://localhost:5001/benchmarking");
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};
const getBenchmarkById = async (req, res, next) => {
  try {
    const benchmarkid = req.params.id;
    const response = await axios.get(
      `http://localhost:5001/benchmarking/${benchmarkid}`
    );
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginCallback,
  getAllUsers,
  getUserById,
  createUser,
  userUpdate,
  userDelete,
  registerCallback,
  getLoggedInUser,
  userTwoCompare,
  userThreeCompare,
  userFourCompare,
  createBenchmark,
  createAnswerByUser,
  createCategory,
  createAnswer,
  createQuestions,
  getAllBenchmarks,
  getBenchmarkById,
  logoutUser,
  getUserByOrganization,
};
