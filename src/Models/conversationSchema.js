const mongoose = require("mongoose");

const { Schema } = mongoose;

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    initBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message", index: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
