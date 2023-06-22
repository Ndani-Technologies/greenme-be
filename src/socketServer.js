/* eslint-disable prefer-const */
/* eslint-disable no-plusplus */
/* eslint-disable global-require */
/* eslint-disable import/no-extraneous-dependencies */
const authSocket = require("./utils/socketAuth");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const directMessageHandler = require("./socketHandlers/directMessageHandler");
const { updateSeenReciept } = require("./socketHandlers/updateChats");
// const directChatHistoryHandler = require('./socketHandlers/directChatHistoryHandler');
// const updateChatFriendsUreadMessageCount = require('./socketHandlers/updates/updateChatFriendsUreadMessageCount');
// const conversationUpdate = require('./socketHandlers/updates/conversations');
const serverStore = require("./socketHandlers/serverStore");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    pingTimeout: 40000,
    cors: {
      // origin: ['http://localhost:3000'],
      origin: [process.env.FRONTEND_URL],
      methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    // console.log('=============>');
    // console.log('User connected');
    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on("direct-message", (data) => {
      directMessageHandler(socket, data);
    });

    socket.on("get-seen-message", (data) => {
      updateSeenReciept(data);
    });

    // socket.on('direct-chat-history', (data) => {
    //   directChatHistoryHandler(socket, data);
    // });

    // socket.on('direct-conversations', (data) => {
    //   const { userId, page, limit } = data;
    //   conversationUpdate.updateConverstationHistory(userId, page, limit);
    // });

    // socket.on('update-read-count', (data) => {
    //   updateChatFriendsUreadMessageCount(socket, data);
    // });

    socket.on("disconnect", () => {
      console.log("User disconnected");
      disconnectHandler(socket);
    });

    socket.on("forceDisconnect", (data) => {
      if (data && data?.length) {
        for (let i = 0; i < data?.length; i++) {
          let temp = {};
          temp.id = data[i];

          if (temp?.id && io?.sockets?.sockets?.get(temp?.id)) {
            io?.sockets?.sockets?.get(temp?.id).disconnect(true);
          }
        }
      }

      // console.log('io', io?.sockets.sockets.get(data[0]));
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};

module.exports = {
  registerSocketServer,
};
