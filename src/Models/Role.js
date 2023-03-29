const mongoose = require("mongoose");

const { Schema } = mongoose;

const roleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permissions",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
