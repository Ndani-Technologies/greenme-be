const passport = require("passport");
const { default: mongoose } = require("mongoose");
const SamlStrategy = require("passport-saml").Strategy;
const fs = require("fs");
const User = require("../Models/User");
const env = require("../configs/index");
const Role = require("../Models/Role");

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
    done(null, user?._id);
  });
});

const spOptions = {
  entity_id: env.entity,
};
const loginUrl = env.loginUrl + spOptions.entity_id;
const { registerUrl } = env;
passport.use(
  "login-saml",
  new SamlStrategy(
    {
      path: "/api/v1/user/login/callback",
      entryPoint: loginUrl,
      issuer: "passport-saml",
      cert: env.IDP_Cert,
      callbackUrl: env.Login_Callback,
    },
    (profile, done) => {
      User.findOne({ email: profile.email }, async (err, user) => {
        if (err) {
          console.log("errors", err);
          return done(err);
        }
        if (!user) {
          const email = profile.email.toString().slice("@")[1];
          const role = await Role.find({});
          let specificRole;
          if (email === "n") {
            specificRole = role.filter((value) => value.title === "user");
          } else {
            specificRole = role.filter((value) => value.title === "admin");
          }
          const { _id } = specificRole[0];

          User.create(
            {
              ...profile,
              email: profile.email,
              uid: profile.uid,
              state: profile.state,
              organization: profile.organization,
              firstName: profile.firstName,
              lastName: profile.lastName,
              role: _id,
              areasOfExpertise: profile.areasOfExpertise,
              profilePic: profile.profilePic,
            },
            (error, newUser) => {
              if (error) {
                return done(error, null);
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
      path: "/api/v1/register/callback",
      entryPoint: registerUrl,
      issuer: "passport-saml",
      cert: env.IDP_Cert,
      callbackUrl: env.Register_Callback,
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

module.exports = passport;
