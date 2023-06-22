const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new mongoose.Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", index: true },
    content: { type: String },
    date: { type: Date, index: true },
    type: { type: String },
    receiver: { type: Schema.Types.ObjectId, ref: "User", index: true },
    read: { type: Boolean, default: false },
    uuid: { type: String, required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
      required: [true, "conversation is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
