const express = require("express");

const UserRouter = express.Router();
const bodyParser = require("body-parser");
const passport = require("../middleware/passport");
const userController = require("../Controller/userController");

UserRouter.post(
  "/login/callback",
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate("login-saml", {
    failureRedirect: "/api/v1/user/login",
    failureMessage: "error",
  }),
  userController.loginCallback
);
UserRouter.get("/login", passport.authenticate("login-saml"));

UserRouter.get("/getLoggedInUser", userController.getLoggedInUser);

UserRouter.get("/signup", passport.authenticate("register-saml"));

UserRouter.post(
  "/signup/callback",
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate("register-saml", {
    failureRedirect: "/signup",
    failureMessage: "error",
  }),
  userController.registerCallback
);

UserRouter.get("/login", passport.authenticate("login-saml"));

UserRouter.get("/signup", passport.authenticate("register-saml"));

UserRouter.get("/logout", userController.logoutUser);
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - organization
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user.
 *         email:
 *           type: string
 *           description: The email address of the user.
 *         state:
 *           type: string
 *           description: The state of the user.
 *         organization:
 *           type: string
 *           description: The organization of the user.
 *         firstName:
 *           type: string
 *           description: The first name of the user.
 *         lastName:
 *           type: string
 *           description: The last name of the user.
 *         areaOfExpertise:
 *           type: array
 *           items:
 *             type: string
 *           description: The area of expertise of the user.
 *         profilePic:
 *           type: string
 *           description: The profile picture of the user.
 *         uid:
 *           type: number
 *           description: The unique ID of the user.
 *         role:
 *           type: string
 *           description: The role of the user.
 *         timezone:
 *           type: string
 *           description: The timezone of the user.
 *       example:
 *        "_id": "6422d2c9c6ccda3a3fc60a3e"
 *        "email": "info@ndani.co.ke"
 *        "state": "active"
 *        "organization": "Fleet Forum"
 *        "firstName": "Ndani"
 *        "lastName": "Tester 2"
 *        "areaOfExpertise": []
 *        "profilePic": "https://knowledge.fleetforum.org/public/avatars/128x128_default-avatar.png"
 *        "uid": 1380
 *        "createdAt": "2023-03-28T11:43:05.810Z"
 *        "updatedAt": "2023-03-30T14:26:52.639Z"
 *        "__v": 0
 *        "timezone": "GMT 1"
 * tags:
 *   name: User
 *   description: API for managing users
 * /user:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to retrieve
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 *   patch:
 *     summary: Update a user by ID
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to update
 *         required: true
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of user to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */

UserRouter.get("/", userController.getAllUsers);

UserRouter.get("/:id", userController.getUserById);

UserRouter.post("/", userController.createUser);

UserRouter.patch("/:id", userController.userUpdate);

UserRouter.delete("/:id", userController.userDelete);

UserRouter.post("/compare/compareUsers", userController.userCompare);


UserRouter.get(
  "/organization/:organization",
  userController.getUserByOrganization
);

UserRouter.post("/createBench", userController.createBenchmark);

UserRouter.post("/createAnswerByUser", userController.createAnswerByUser);

UserRouter.post("/createCategory", userController.createCategory);

UserRouter.post("/createAnswers", userController.createAnswer);

UserRouter.post("/createQuestions", userController.createQuestions);

module.exports = UserRouter;
