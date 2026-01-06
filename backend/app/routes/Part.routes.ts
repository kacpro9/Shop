import { Router } from "express";
import { createPart, getParts, getPartById, updatePart, deletePart } from "../controllers/Part.controller";
import { authRequired } from "../middlewares/auth.middleware";
import { roleRequired } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.get("/", getParts);
router.get("/:id", getPartById);

// Admin routes
router.post("/", authRequired, roleRequired("admin"), createPart);
router.patch("/:id", authRequired, roleRequired("admin"), updatePart);
router.delete("/:id", authRequired, roleRequired("admin"), deletePart);

export default router;