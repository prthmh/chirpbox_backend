import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors, JwtPayload } from "jsonwebtoken";
import { envObj } from "../constants";
import { UserDocument } from "../models/user.model";

const secret = envObj.JWT_SECRET_KEY;

interface AuthRequest extends Request {
  user?: { _id?: string; username?: string };
}

function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ errorMsg: "Unauthorised access" });
  }

  jwt.verify(
    token,
    secret,
    (
      err: VerifyErrors | null,
      decodedToken: string | JwtPayload | undefined
    ) => {
      if (err || !decodedToken || typeof decodedToken === "string") {
        return res.status(403).json({ errorMsg: "Token is not valid" });
      }

      if ("_id" in decodedToken && "username" in decodedToken) {
        req.user = {
          _id: decodedToken._id,
          username: decodedToken.username,
        };
      }

      next();
    }
  );
}

export default verifyToken;
