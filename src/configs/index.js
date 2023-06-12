const indexENV = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5000,
  secrectKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_URL,
  mongoUrlRemote: process.env.MONGO_URL_REMOTE,
  timezoneKey: process.env.TIMEZONE_KEY,
  loginUrl: process.env.LOGIN_URL,
  registerUrl: process.env.REGISTER_URL,
  redisPort: process.env.REDIS_PORT,
  redisUrl: process.env.REDIS_URL,
  IDP_Cert: process.env.IDP_CRT,
  Login_Callback: process.env.LOGIN_CALLBACK,
  Register_Callback: process.env.REGISTER_CALLBACK,
  entity: process.env.ENTITY,
  usermoduleUrl: process.env.USER_MODULE_URL,
};

module.exports = indexENV;
