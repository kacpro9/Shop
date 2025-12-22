import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import { validateNip } from "../utils/validateNip";
import bcrypt from "bcryptjs";

//GET /api/admin/users
export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

//GET /api/admin/users/:id
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

//POST /api/admin/users
export const createUserAsAdmin = async (
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
      role,
      address,
      companyName,
      nip,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({
      email: normalizedEmail,
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    if (nip !== undefined && nip !== null && nip !== "") {
      if (!validateNip(String(nip))) {
        return res.status(400).json({ message: "Invalid NIP number" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      address, //{street, suite?, city, zipcode}
      companyName,
      nip,
    });

    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};
//PATCH /api/admin/users/:id
export const updateUserAsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, role, address, companyName, nip } = req.body;

    if (nip !== undefined && nip !== null && nip !== "") {
      if (!validateNip(String(nip))) {
        return res.status(400).json({ message: "Invalid NIP number" });
      }
    }

    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (companyName !== undefined) updates.companyName = companyName;
    if (nip !== undefined) updates.nip = nip;
    if (role !== undefined) updates.role = role;
    if (address !== undefined) updates.address = address;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

//DELETE /api/admin/users/:id
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
