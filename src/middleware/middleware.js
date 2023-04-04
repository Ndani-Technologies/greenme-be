const passport = require("passport");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");
const idpConfig = require("../configs/config");
const config = require("../configs/config");
const User = require("../Models/User");
const env = require("../configs/dev");

passport.serializeUser((req, user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return done(null, false);
  }
  User.findById(id, (err, user) => {
    if (err) {
      done(err);
    }
    done(null, user._id);
  });
});

const spOptions = {
  entity_id: idpConfig.local.entity,
};
const loginUrl = env.loginUrl + spOptions.entity_id;
const { registerUrl } = env;

passport.use(
  "login-saml",
  new SamlStrategy(
    {
      path: "/user/login/callback",
      entryPoint: loginUrl,
      issuer: "passport-saml",
      cert: fs.readFileSync("./src/assets/idp.crt", "utf-8"),
      callbackUrl: "http://localhost:5000/user/login/callback",
    },
    (profile, done) => {
      User.findOne({ email: profile.email }, (err, user) => {
        if (err) {
          console.log("errors", err);
          return done(err);
        }
        if (!user) {
          User.create(
            {
              email: profile.email,
              uid: profile.uid,
              state: profile.state,
              organization: profile.organization,
              firstName: profile.firstName,
              lastName: profile.lastName,
              areasOfExpertise: profile.areasOfExpertise,
              profilePic: profile.profilePic,
            },
            (error, newUser) => {
              if (error) {
                return done(err);
              }
              return done(null, newUser);
            }
          );
        }
        return done(null, user);
      });
    }
  )
);

passport.use(
  "register-saml",
  new SamlStrategy(
    {
      path: "/user/register/callback",
      entryPoint: registerUrl,
      issuer: "passport-saml",
      cert: fs.readFileSync("./src/assets/idp.crt", "utf-8"),
      callbackUrl: "http://localhost:5000/user/register/callback",
    },
    (profile, done) => {
      User.findOne({ email: profile.email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          User.create(
            {
              email: profile.email,
              uid: profile.uid,
              state: profile.state,
              organization: profile.organization,
              firstName: profile.firstName,
              lastName: profile.lastName,
              areasOfExpertise: profile.areasOfExpertise,
              profilePic: profile.profilePic,
            },
            (error, newUser) => {
              if (error) {
                return done(err);
              }
              return done(null, newUser);
            }
          );
        }
        return done(null, user);
      });
    }
  )
);

const getToken = (user) =>
  jwt.sign(user, config.secretKey, { expiresIn: 3600 });
const checkLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else next(new Error("Already Logout."));
};
const isLocalAuthenticated = function (req, res, next) {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      next(new Error("User Doesn't Exist"));
    }
    next();
  })(req, res, next);
};
const isAdmin = (req, res, next) => {
  try {
    User.findOne({ _id: req.user })
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
          if (user?.role?.title === "Admin") {
            next();
          } else {
            const err = new Error(
              "You are not authorized to perform this operation!"
            );
            err.status = 403;
            return next(err);
          }
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    const error = new Error(
      "You are not authorized to perform this operation!"
    );
    error.status = 403;
    next(err);
  }
};
module.exports = {
  getToken,
  isAdmin,
  isLocalAuthenticated,
  checkLogin,
};
