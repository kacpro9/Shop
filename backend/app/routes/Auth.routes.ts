import { Router } from "express";
import { register, login, getMe } from "../controllers/Auth.controller";
import { authRequired } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, getMe);

export default router;
