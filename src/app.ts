import { AttemptQuestion, RawQuizData } from "./helper/interfaces";
import { decodeToken, isNewUser, isPasswordCorrect } from "./middleware/auth";
import {
  createQuiz,
  getLeaderboard,
  logAttempt,
  resumeQuiz,
} from "./quiz/quiz";
import { createUser, fetchUserFromAuth0, loginUser } from "./users/users";
import { toArray } from "./helper/validator";
import { redis } from "./helper/redis_helper";

const express = require("express");

require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", decodeToken, (req: any, res: any) => {
  res.send(req.user ? "Logged in" : "Logged out");
});

app.post("/login", async (req: any, res: any) => {
  var data = req.body;
  let email = data.email;
  let password = data.password;
  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Both email and password are required" });
  }

  let login = await isPasswordCorrect(email, password);
  if (!login) {
    return res.status(401).send({ message: "Incorrect Password/Email" });
  }

  const redis_access_token_key = "access_token_" + email;

  const redisResponse = await redis.get(redis_access_token_key);

  if (redisResponse) {
    return res.status(200).send({ accessToken: redisResponse });
  }

  try {
    let access_token = await loginUser(email, password);

    if (access_token) {
      await redis.set(
        redis_access_token_key,
        access_token,
        "EX",
        60 * 60 * 24 * 1
      );
      res.status(200).send({ accessToken: access_token });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error });
  }
});

app.post("/signup", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send({ message: "Both email and password are required" });
  }

  const userDoesNotAccountExist = await isNewUser(email);

  if (!userDoesNotAccountExist) {
    return res.status(400).send({ message: "Email already exists" });
  }

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

  if (
    !quizData.title ||
    !quizData.questions ||
    !Array.isArray(quizData.questions)
  ) {
    return res.status(400).json({ message: "Invalid quiz data format" });
  }

  try {
    let newQuizId: any = await createQuiz(quizData, user.id);
    res.status(200).send({
      message: "Quiz with id " + newQuizId.id + " created successfully",
      shareable_url:
        "http://" +
        process.env.BASE_URL +
        ":" +
        process.env.PORT +
        "/quiz/" +
        newQuizId.id,
    });
  } catch (error) {
    res.status(401).send({ message: "Quiz not created", error: error });
  }
});

app.get("/quiz/:id", decodeToken, async (req: any, res: any) => {
  let quizId = req.params.id;
  let user: any = await fetchUserFromAuth0(req.user);
  try {
    let quiz = await resumeQuiz(parseInt(quizId), user.id);
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

app.post("/quiz/answer", decodeToken, async (req: any, res: any) => {
  let user = await fetchUserFromAuth0(req.user);
  if (!user) {
    return res.status(401).send({ message: "User not found" });
  }
  let quizId = req.body.quizId;
  let attempt_data: AttemptQuestion[] = toArray(req.body.attempt_data);

  if (!quizId || !attempt_data) {
    return res.status(400).send({ message: "Invalid data format" });
  }

  try {
    let attempt = await logAttempt(quizId, attempt_data, user.id);
    if (attempt.count > 0) {
      res.status(200).send({ message: "Attempt submitted successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Quiz submission error", error: error });
  }
});

app.get("/quiz/:id/leaderboard", decodeToken, async (req: any, res: any) => {
  let quizId = req.params.id;
  try {
    let leaderboard = await getLeaderboard(parseInt(quizId));
    if (leaderboard) {
      res.status(200).send({ leaderboard: leaderboard });
    } else {
      res.status(400).send({ message: "Leaderboard not present" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Leaderboard Error", error: error });
  }
});

app.get("/profile", decodeToken, async (req: any, res: any) => {
  let user = await fetchUserFromAuth0(req.user);
  res.send(JSON.stringify({ hello: req.user, user: user?.id }));
});

if (process.env.NODE_ENV === "production") {
  app.listen(process.env.PORT || 3000);
} else {
  app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}
