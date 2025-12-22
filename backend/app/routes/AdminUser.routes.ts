import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware";
import { roleRequired } from "../middlewares/role.middleware";
import {
  listUsers,
  getUserById,
  createUserAsAdmin,
  updateUserAsAdmin,
  deleteUserAsAdmin,
} from "../controllers/AdminUser.controller";

const router = Router();

router.use(authRequired, roleRequired("admin"));

//GET /api/admin/users
router.get("/", listUsers);

//GET /api/admin/users/:id
router.get("/:id", getUserById);

//POST /api/admin/users
router.post("/", createUserAsAdmin);

//PATCH /api/admin/users/:id
router.patch("/:id", updateUserAsAdmin);

//DELETE /api/admin/users/:id
router.delete("/:id", deleteUserAsAdmin);

export default router;
