import { ClientRequest } from "http";

const { auth } = require("express-openid-connect");
var AuthenticationClient = require("auth0").AuthenticationClient;
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

var auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

// req.isAuthenticated is provided from the auth router
app.get("/", auth(config), (req: any, res: any) => {
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.post("/post-login", async (req: any, res: any) => {
  var data = req.body;
  let username = data.username;
  let password = data.password;

  const authResult = await req.oidc
    .grant({
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      username,
      password,
      audience: process.env.AUTH0_AUDIENCE_URL,
      realm: process.env.AUTH0_REALM,
    })
    .catch((err: any) => {
      console.error(err);
      res.status(401).send("Invalid credentials");
    });

  // Generate access token
  const { access_token } = jwt.decode(authResult.access_token);
  res.send(access_token);
});

app.get("/profile", auth(config), (req: any, res: any) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
