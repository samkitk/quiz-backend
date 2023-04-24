import { auth0_client, auth0_management_client } from "./helper/auth0_helper";
import { RawQuizData } from "./helper/interfaces";
import { decodeToken } from "./middleware/auth";
import { createQuiz, getQuiz } from "./quiz/quiz";
import { createUser, fetchUserFromAuth0, loginUser } from "./users/users";

const { auth } = require("express-openid-connect");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.json());

const config = {
  authRequired: process.env.CONFIG_AUTH_REQUIRED,
  auth0Logout: process.env.CONFIG_AUTH0_LOGOUT,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: process.env.AUTH0_CLIENT_SECRET,
};

app.get("/", (req: any, res: any) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.post("/login", async (req: any, res: any) => {
  var data = req.body;
  let email = data.email;
  let password = data.password;

  try {
    let access_token = await loginUser(email, password);

    if (access_token) {
      res.status(200).send({ accessToken: access_token });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error });
  }
});

app.post("/signup", async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    let newUser = await createUser(email, password);
    if (newUser) {
      res.status(200).send({ message: "User created successfully" });
    } else {
      res.status(401).send({ message: "User not created" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error });
  }
});

app.post("/quiz/add", decodeToken, async (req: any, res: any) => {
  let quizData: RawQuizData = req.body;
  let user: any = await fetchUserFromAuth0(req.user);
  try {
    let newQuizId = await createQuiz(quizData, user.id);
    console.log("NEQ", newQuizId);
    res.status(200).send({ message: "Quiz created successfully" });
  } catch (error) {
    res.status(401).send({ message: "Quiz not created", error: error });
  }
});

app.get("/quiz/:id", decodeToken, async (req: any, res: any) => {
  let quizId = req.params.id;
  try {
    let quiz = await getQuiz(parseInt(quizId));
    if (quiz) {
      res.status(200).send({ quiz: quiz });
    } else {
      res.status(400).send({ message: "Quiz not present" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Quiz not found", error: error });
  }
});

app.get("/profile", decodeToken, (req: any, res: any) => {
  res.send(JSON.stringify({ hello: req.user }));
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
