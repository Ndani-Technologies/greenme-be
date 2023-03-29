// const LocalStrategy = require('passport-local').Strategy;
// const jwtStrategy = require('passport-jwt').Strategy;
// const Extractjwt = require('passport-jwt').ExtractJwt;
// var path = require('path')
const passport = require("passport");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");
const idpConfig = require("../configs/config");
const config = require("../configs/config");
const User = require("../Models/User");

// exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((req, user, done) => {
  // done(null, user.uid);
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
    // done(err, user.uid);
    done(null, user._id);
  });
});

const spOptions = {
  entity_id: idpConfig.local.entity,
  // private_key: fs.readFileSync("./assets/certificates/server.pem").toString(),
  // certificate: fs.readFileSync("./assets/certificates/server.crt").toString(),
  // assert_endpoint: idpConfig["local"].assert,
  // allow_unencrypted_assertion: true,
};
const loginUrl = `https://login.fleetforum.org/saml2/idp/SSOService.php?spentityid=${spOptions.entity_id}`;
passport.use(
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
                console.log("errors", err);
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

// passport.use(new LocalStrategy(
//     function (username, password, done, next) {
//         User.findOne({ username: username }, function (err, user) {
//             if (err) {
//                 return done(err, false, { message: "Invalid Email or password" })
//             } else if (user) {
//                 return done(null, user);
//             } else {
//                 return done(null, false, { message: "User Does not exist." });
//             }
//         });
//     }
// ));

exports.getToken = (user) =>
  jwt.sign(user, config.secretKey, { expiresIn: 3600 });
exports.checkLogin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else next(new Error("Already Logout."));
};
exports.isLocalAuthenticated = function (req, res, next) {
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
exports.isAdmin = (req, res, next) => {
  console.log("user", req.user);
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
        console.log("err", err);
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
