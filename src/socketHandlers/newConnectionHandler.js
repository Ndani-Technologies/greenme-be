const serverStore = require("./serverStore");
// const conUpdates = require('./updates/conversations');
const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.user;

  serverStore.addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails?.id,
  });

  //   if (userDetails && userDetails?.type) {
  //     conUpdates.updateConverstationHistory(userDetails?.id);
  //   }
};

module.exports = newConnectionHandler;
