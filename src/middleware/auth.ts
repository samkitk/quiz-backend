import { Request, Response, NextFunction } from "express";
import { auth0_client } from "../helper/auth0_helper";
import jwt from "jsonwebtoken";
import jwt_decode from "jwt-decode";

interface AuthenticatedRequest extends Request {
  user?: any;
}

interface DecodedToken {
  iss?: string;
  sub?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  azp?: string;
  scope?: string;
  gty?: string;
}

export const decodeToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.body.token = bearerToken;

    try {
      const decoded: DecodedToken = jwt_decode(bearerToken);
      console.log("decoded", decoded);

      if (decoded) {
        req.user = decoded.sub;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(403);
  }
};
