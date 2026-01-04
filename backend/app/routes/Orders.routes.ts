import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
} from "../controllers/Order.controller";

const router = Router();

router.post("/", authRequired, createOrder);
router.get("/my", authRequired, getMyOrders);
router.get("/:id", authRequired, getOrderById);
router.post("/:id/pay", authRequired, payOrder);

export default router;
