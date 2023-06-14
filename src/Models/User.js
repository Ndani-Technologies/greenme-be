const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
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
        default: ["National Global Regional"],
      },
    ],
    otherCountries: [
      {
        type: String,
        default: ["Pakistan", "Iran", "Canada"],
      },
    ],
    areaOfExpertise: [
      {
        type: String,
      },
    ],
    profilePic: { type: String },
    backgroundPic: { type: String },
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
    phone: {
      type: Number,
    },
    state: {
      type: String,
    },
    leadScore: {
      type: Number,
    },
    tags: {
      type: String,
      enum: ["Exiting", "Lead", "Long-term", "Partner"],
    },
    actionPoints: {
      type: Number,
      default: 0,
    },
    collaborationPoints: {
      type: Number,
      default: 0,
    },
    discussionPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      // get(){
      //   return (this.collaborationPoints + this.discussionPoints+ this.actionPoints);
      // },
      default: 0,
    },
    leaderboardPosition: {
      type: Number,
    },

  },
  { timestamps: true },
  { autoIndex: false }
);

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;
