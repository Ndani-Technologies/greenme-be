/* eslint-disable prefer-arrow-callback */
const connectedUsers = new Map();
let io = null;
const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => io;

const addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });

  console.log(connectedUsers);
};

const removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
  }
};

const getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value) => {
    onlineUsers.push(value.userId);
  });
  return onlineUsers;
};

const getActiveConnections = (userId) => {
  const activeConnections = [];

  connectedUsers.forEach(function (key, value) {
    if (key.userId === userId) {
      activeConnections.push(value);
    }
  });

  return activeConnections;
};

module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getOnlineUsers,
};
