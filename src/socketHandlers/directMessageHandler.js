/* eslint-disable dot-notation */
/* eslint-disable object-shorthand */
const MESSAGE = require("../Models/messageSchema");
const CONVERSATION = require("../Models/conversationSchema");
const chatUpdates = require("./updateChats");

const directMessageHandler = async (socket, data) => {
  try {
    const { receiver, content, author, uuid } = data;
    let message = null;

    const conversation = await CONVERSATION.findOne({
      participants: { $all: [author, receiver] },
      isActive: true,
    });

    message = await MESSAGE.create({
      content: content,
      author: author,
      date: new Date(),
      type: "DIRECT",
      receiver: receiver,
      uuid,
      ...(conversation && { conversationId: conversation?._id }),
      ...(!conversation && { conversationId: "63bbfe956380637688ef700f" }),
    });

    if (conversation) {
      conversation.messages.push(message?._id);
      message["conversationId"] = conversation?._id;
      await conversation.save();

      chatUpdates.updateChatHistory(
        conversation._id.toString(),
        receiver,
        author,
        message
      );
    } else {
      const newConversation = await CONVERSATION.create({
        messages: [message._id],
        participants: [author, receiver],
        initBy: author,
      });

      message["conversationId"] = newConversation?._id;

      chatUpdates.updateChatHistory(
        newConversation._id.toString(),
        receiver,
        author,
        message
      );
    }

    await message.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = directMessageHandler;
