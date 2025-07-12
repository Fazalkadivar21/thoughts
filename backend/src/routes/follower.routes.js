import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
	toggleFollow,
	getFollowers,
	getFollowing,
} from "../controllers/follower.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle-follow").post(toggleFollow);
router.route("/get-followers").get(getFollowers);
router.route("/get-following").get(getFollowing);

export default router;
