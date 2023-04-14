const redis = require("redis");
const { promisify } = require("util");

let redisClient;
const connectClient = async () => {
  console.log("here");
  redisClient = redis.createClient();
  await redisClient.connect();
  console.log("here 2");
};

connectClient();
redisClient.on("error", (error) => console.log("redis not connected", error));
redisClient.on("connect", () => console.log("redis  connected"));

const GET_ASYNC = promisify(redisClient.get).bind(redisClient);
const SET_ASYNC = promisify(redisClient.set).bind(redisClient);

module.exports = { redisClient, GET_ASYNC, SET_ASYNC };
