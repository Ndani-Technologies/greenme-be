const mongoose = require("mongoose");

const { Schema } = mongoose;
const permissionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    route: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Permissions = mongoose.model("Permissions", permissionSchema);

module.exports = Permissions;
