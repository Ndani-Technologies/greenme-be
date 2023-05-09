const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
    },
    country: {
      type: String,
    },
    organization: {
      type: String,
      require: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    scope: [
      {
        type: String,
      },
    ],
    otherCountries: [
      {
        type: String,
      },
    ],
    areaOfExpertise: [{ type: String }],
    profilePic: { type: String },
    uid: { type: Number },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    position: {
      type: String,
      require: true,
    },
    timezone: {
      type: String,
      default: "GMT",
    },
    designation: {
      type: String,
    },
    phone: {
      type: Number,
    },
  },
  { timestamps: true }
);
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;
