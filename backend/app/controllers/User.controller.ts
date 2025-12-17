import { Response, NextFunction } from "express";
import { User } from "../models/User.model";
import { AuthRequest } from "../middlewares/auth.middleware";

//GET /api/users/me

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
  } catch (error) {
    next(error);
  }
};

//PATCH /api/users/me
export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { firstName, lastName, companyName, nip, address } = req.body;

    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (companyName !== undefined) updates.companyName = companyName;
    if (nip !== undefined) updates.nip = nip;
    if (address !== undefined) updates.address = address;

    delete updates.role;
    delete updates.password;
    delete updates.email;

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
