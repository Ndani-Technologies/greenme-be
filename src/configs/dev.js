const devEnv = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5000,
  secrectKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_URL,
  timezoneKey: process.env.TIMEZONE_KEY,
  loginUrl: process.env.LOGIN_URL,
  registerUrl: process.env.REGISTER_URL,
};

module.exports = devEnv;
