import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const roleRequired =
  (requiredRole: "admin" | "user") =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
