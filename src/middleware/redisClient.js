const redis = require("redis");

let redisClient;
const connectClient = async () => {
  redisClient = redis.createClient(process.env.REDIS_URL);
  await redisClient.connect();
};

connectClient();
redisClient.on("error", (error) => console.log("redis not connected", error));
redisClient.on("connect", () => console.log("redis  connected"));

module.exports = { redisClient };
