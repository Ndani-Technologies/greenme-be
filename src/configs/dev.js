const devEnv = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 5001,
  secrectKey: process.env.SECRET_KEY,
  mongoUrl: process.env.MONGO_URL,
  mongoUrlRemote: process.env.MONGO_URL_REMOTE,
  timezoneKey: process.env.TIMEZONE_KEY,
  loginUrl: process.env.LOGIN_URL,
  registerUrl: process.env.REGISTER_URL,
  idpCertificate: process.env.IDP_CERTIFICATE,
};

module.exports = devEnv;
