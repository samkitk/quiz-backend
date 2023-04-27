import { Request, Response, NextFunction } from "express";
import jwt_decode from "jwt-decode";
import { AuthenticatedRequest, DecodedToken } from "../helper/interfaces";
import { prisma } from "../helper/prisma_helper";
import { hashIt } from "../helper/hash";

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

export async function isPasswordCorrect(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      password: true,
    },
  });

  if (user?.password) {
    return user.password === (await hashIt(password));
  }
  return false;
}

export async function doesUserAccountExist(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    return true;
  }
  return false;
}
