/* eslint-disable no-use-before-define */
/* eslint-disable object-shorthand */
const mongoose = require("mongoose");
const CONVERSATION = require("../Models/conversationSchema");
const MESSAGE = require("../Models/messageSchema");
const USER = require("../Models/User");
const serverStore = require("./serverStore");

const updateChatHistory = async (conversationId, receiver, author, message) => {
  const tempMessage = await MESSAGE.findById(message._id)
    .populate({ path: "author", model: USER })
    .populate({ path: "receiver", model: USER })
    .exec();
  let conversation = await CONVERSATION.findOne({
    _id: conversationId,
  })
    .populate([
      {
        path: "initBy",
      },
    ])
    .select("-messages")
    .exec();

  const unreadCount = await MESSAGE.count({
    receiver: mongoose.Types.ObjectId(receiver),
    read: false,
  });

  if (conversation) {
    conversation = JSON.parse(JSON.stringify(conversation));
    const io = serverStore.getSocketServerInstance();
    conversation.participants.forEach((userId) => {
      const activeConnections = serverStore.getActiveConnections(
        userId.toString()
      );
      activeConnections.forEach((socketId) => {
        io.to(socketId).emit("direct-chat-history", {
          message: tempMessage,
          participants: conversation.participants,
          initBy: conversation.initBy,
          isActive: conversation.isActive,
          conversation: { ...conversation, unreadCount: unreadCount },
        });
      });
    });
  }
};

const updateSeenReciept = async (data) => {
  const { conversationId, receiver } = data;

  console.log({ data });

  await sendSeenReciept(data);

  await MESSAGE.updateMany(
    { conversationId: conversationId, receiver: receiver },
    {
      $set: {
        read: true,
      },
    }
  );
};

const sendSeenReciept = async (data) => {
  const { message, receiver } = data;

  const io = serverStore.getSocketServerInstance();
  const recieverList = serverStore.getActiveConnections(receiver);

  recieverList.forEach((receiverSocketId) => {
    io.to(receiverSocketId).emit("seen-message-response", {
      ...{ read: true, ...message },
    });
  });
};

module.exports = {
  updateChatHistory,
  updateSeenReciept,
};
