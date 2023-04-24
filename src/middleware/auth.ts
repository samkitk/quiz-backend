import { Request, Response, NextFunction } from "express";
import jwt_decode from "jwt-decode";
import { AuthenticatedRequest, DecodedToken } from "../helper/interfaces";

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
