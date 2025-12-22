import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware";
import { getMe, updateMe } from "../controllers/User.controller";

const router = Router();

router.use(authRequired);

//GET /api/users/me
router.get("/me", getMe);

//PATCH /api/users/me
router.patch("/me", updateMe);

export default router;
