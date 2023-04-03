const devEnv = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5000,
  secrectKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_URL,
  timezoneKey: process.env.TIMEZONE_KEY,
};

module.exports = devEnv;
