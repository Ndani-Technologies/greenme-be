const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

// A security package that helps protect against common vulnerabilities.
app.use(helmet());

// It allows the server to accept requests from other domains.
app.use(cors());

// It allows the server to accept JSON data in the body of the request.
app.use(express.json());

// It allows the server to accept URL encoded data in the body of the request.
app.use(express.urlencoded({ extended: false }));

module.exports = app;
