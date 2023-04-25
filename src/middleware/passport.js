const passport = require("passport");
const { default: mongoose } = require("mongoose");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");
const idpConfig = require("../configs/config");
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
const { registerUrl, idpCertificate } = env;
if (fs.existsSync(idpCertificate)) {
  passport.use(
    "login-saml",
    new SamlStrategy(
      {
        path: "/user/login/callback",
        entryPoint: loginUrl,
        issuer: "passport-saml",
        cert: fs.readFileSync(idpCertificate, "utf-8"),
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
} else {
  console.log("Path doesn't exist.");
}
if (fs.existsSync(idpCertificate)) {
  passport.use(
    "register-saml",
    new SamlStrategy(
      {
        path: "/register/callback",
        entryPoint: registerUrl,
        issuer: "passport-saml",
        cert: fs.readFileSync(idpCertificate, "utf-8"),
        callbackUrl: "http://localhost:5001/register/callback",
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
} else {
  console.log("Path doesn't exist.");
}
module.exports = passport;
