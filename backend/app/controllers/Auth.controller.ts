import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model";
import { AuthRequest } from "../middlewares/auth.middleware";

const signToken = (payload: { id: string; role: "admin" | "user" }) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

//POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      phoneNumber,
      companyName,
      nip,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exist = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (exist) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
      address, //{street, suite?, city, zipcode}
      companyName,
      nip,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });

    const safeUser = await User.findById(user._id);

    return res.status(201).json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
};

//POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken({ id: user._id.toString(), role: user.role });

    // return user data without password
    const safeUser = await User.findById(user._id);

    return res.status(200).json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
};

//GET /api/auth/me
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
};
