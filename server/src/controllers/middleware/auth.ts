import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import { Request, Response, NextFunction } from "express";
import { userInfo } from "os";

const JWT_SECRET : string = config.get<string>("JWT_SECRET");

interface AuthRequest extends Request {
    user?: string | JwtPayload; // Attach decoded token data
}

const authMiddleWare =  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided or invalid format." });
        return;
      }

      const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token,JWT_SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: "Invalid token" });
    }
}

export default authMiddleWare;