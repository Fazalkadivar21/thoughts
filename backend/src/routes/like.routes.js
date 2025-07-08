import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { toggleLikes } from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/toggle-like").post(toggleLikes)

export default router