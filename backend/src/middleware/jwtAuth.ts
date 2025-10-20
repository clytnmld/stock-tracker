import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET as string);
    (req as any).role = decoded;
    console.log(decoded);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export function authorizedRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).role?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
