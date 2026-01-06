import { Request, Response, NextFunction } from "express";
import { Part } from "../models/Part.model";

//POST /api/parts (admin)
export const createPart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, stockQuantity, dateOfDelivery } =
      req.body;

    const priceNum = Number(price);
    const stockQuantityNum = Number(stockQuantity);

    if (!name || Number.isNaN(priceNum) || Number.isNaN(stockQuantityNum)) {
      return res
        .status(400)
        .json({ message: "Name, price and stock quantity are required" });
    }

    const created = await Part.create({
      name,
      description,
      price: priceNum,
      stockQuantity: stockQuantityNum,
      dateOfDelivery,
    });

    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

//GET /api/parts (public)
export const getParts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //simple filtering
  try {
    const { q, minPrice, maxPrice } = req.query;

    const filter: any = {};

    if (q) {
      filter.name = { $regex: String(q), $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const parts = await Part.find(filter).sort({ createdAt: -1 });
    return res.json(parts);
  } catch (error) {
    next(error);
  }
};

//GET /api/parts/:id (public)
export const getPartById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }
    return res.json(part);
  } catch (error) {
    next(error);
  }
};

//PATCH /api/parts/:id (admin)
export const updatePart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, price, stockQuantity, dateOfDelivery } =
      req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (stockQuantity !== undefined) updates.stockQuantity = stockQuantity;
    if (dateOfDelivery !== undefined) updates.dateOfDelivery = dateOfDelivery;

    const updated = await Part.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Part not found" });
    }
    return res.json(updated);
  } catch (error) {
    next(error);
  }
};

//DELETE /api/parts/:id (admin)
export const deletePart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Part.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Part not found" });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
