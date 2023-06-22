/* eslint-disable no-param-reassign */
const jwt = require("jsonwebtoken");
const USER = require("../Models/User");

require("dotenv").config();

const verifyTokenSocket = async (socket, next) => {
  try {
    const token = socket?.handshake?.auth?.token;

    const user = await USER.findById(token);

    if (!user) {
      throw new Error("");
    }

    socket.user = user;
  } catch (err) {
    const socketError = new Error("NOT_AUTHORIZED");
    return next(socketError);
  }
  next();
};

module.exports = verifyTokenSocket;
