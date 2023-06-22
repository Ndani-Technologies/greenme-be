const express = require("express");

const ChatRouter = express.Router();
const chatController = require("../Controller/chatController");

ChatRouter.get("/get-all-conversation/:id", chatController.getConversation);

ChatRouter.get("/get-conversation", chatController.getConversationById);

module.exports = ChatRouter;
