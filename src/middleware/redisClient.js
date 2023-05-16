const redis = require("redis");
const dev = require("../configs/dev");

let redisClient;
const connectClient = async () => {
  redisClient = redis.createClient(dev.redisUrl);

  await redisClient.connect();
};

connectClient();
redisClient.on("error", (error) => console.log("redis not connected", error));
redisClient.on("connect", () => console.log("redis  connected"));

module.exports = { redisClient };
