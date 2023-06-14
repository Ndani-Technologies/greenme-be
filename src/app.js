const express = require("express");
const path = require("path");
require("dotenv/config");

const app = express();
const cors = require("cors");

const expresssession = require("express-session");
const MongoStore = require("connect-mongo");

const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const mongoose = require("mongoose");
const healthcheck = require("./Routes/healthcheck");
const passport = require("./middleware/passport");
const UserRouter = require("./Routes/UsersRouter");
const env = require("./configs/index");
const roleRouter = require("./Routes/RoleRouter");
const permissionRouter = require("./Routes/PermissionRouter");
const logger = require("./middleware/logger");

const url = env.mongoUrl;
const connect = mongoose.connect(url);

connect.then(
  () => {
    console.log("connected Correctly");
  },
  (err) => {
    console.error(err);
  }
);

app.use(
  expresssession({
    secret: env.secrectKey,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongoUrl: env.mongoUrl }),
  })
);

app.use(cors({ origin: "*" }));
app.use(express.static("./assets"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(responseTime);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Green-Me Official",
      version: "0.1.0",
      description: "API Routes and Database Schema for GreenMe-Official",
    },
    servers: [
      {
        url: `http://${env.host}/${env.port}`,
      },
    ],
  },
  apis: ["src/routes/UsersRouter.js"],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use((req, res, next) => {
  // Log the request
  logger.info(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use("/api/v1/auth/user", UserRouter);

app.use("/api/v1/auth/role", roleRouter);
app.use("/api/v1/auth/permission", permissionRouter);
app.use("/api/v1/auth", healthcheck);

app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "Route not found";
  next(err);
});

app.use((err, req, res, next) => {
  logger.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "internal server error",
  });
  next();
});

// error handler
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "MongoServerError" && err.code === 11000) {
    status = 400;
    message = "Duplicate key error";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = err.message;
  }

  res.status(status).json({
    error: {
      status,
      message,
      success: false,
    },
  });
});

module.exports = app;
