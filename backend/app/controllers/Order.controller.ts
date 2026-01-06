import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Order } from "../models/Order.model";
import { Part } from "../models/Part.model";

const daysBetween = (from: Date, to: Date) => {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// POST /api/orders
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { parts } = req.body as {
      parts: Array<{ part: string; quantity: number }>;
    };

    if (!parts || parts.length === 0) {
      return res.status(400).json({ message: "No parts provided" });
    }

    //validation
    for (const item of parts) {
      if (!item.part) {
        return res.status(400).json({ message: "Part ID is required" });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
    }

    const partId = parts.map((p) => p.part);
    const dbParts = await Part.find({ _id: { $in: partId } });

    if (dbParts.length !== parts.length) {
      return res.status(400).json({ message: "One or more parts are invalid" });
    }

    const partMap = new Map(dbParts.map((p) => [p._id.toString(), p]));

    let totalPrice = 0;
    let estimatedDays = 0;

    const now = new Date();

    for (const item of parts) {
      const p = partMap.get(item.part);
      if (!p) return res.status(400).json({ message: "Part not found" });

      totalPrice += p.price * item.quantity;

      const missing = item.quantity - p.stockQuantity;

      if (missing > 0) {
        if (!p.dateOfDelivery) {
          return res.status(400).json({
            message: `Part ${p.name} is out of stock and has no delivery date`,
          });
        }

        const days = daysBetween(now, p.dateOfDelivery);
        estimatedDays = Math.max(estimatedDays, days);
      }
    }
    const order = new Order({
      user: userId,
      parts: parts.map((item) => ({
        part: item.part,
        quantity: item.quantity,
      })),
      totalPrice,
      estimatedFulfillmentDays: estimatedDays,
    });

    return res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/my
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user?.id;
    const role = req.user?.role;

    if (order.user.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(order);
  } catch (error) {
    next(error);
  }
};

//POST /api/orders/:id/pay - fake payment
export const payOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (order.paymentStatus === "completed") {
      return res.status(400).json({ message: "Order already paid" });
    }

    order.paymentStatus = "completed";
    await order.save();

    return res.json(order);
  } catch (error) {
    next(error);
  }
};

//DELETE /api/orders/:id - cancel order
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel an order that is already shipped or delivered",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already canceled" });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
