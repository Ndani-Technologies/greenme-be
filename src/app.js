const express = require("express");
const createError = require("http-errors");
const path = require("path");
require("dotenv/config");

const app = express();
const cors = require("cors");
const passport = require("passport");
const expresssession = require("express-session");
const MongoStore = require("connect-mongo");

const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const mongoose = require("mongoose");
const UserRouter = require("./Routes/UsersRouter");
const env = require("./configs/dev");
const roleRouter = require("./Routes/RoleRouter");
const permissionRouter = require("./Routes/PermissionRouter");

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

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

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use("/user", UserRouter);
app.use("/role", roleRouter);
app.use("/permission", permissionRouter);

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  console.log("error", err);

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
