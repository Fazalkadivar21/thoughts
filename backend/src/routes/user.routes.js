import { Router } from "express";
import {
	changePass,
	login,
	register,
	updateAvatar,
	updateCoverImage,
	logout,
	refreshToken,
	getUser,
	updateAccountData,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/:username").get(getUser);

router.route("/register").post(
	upload.fields([
		{
			name: "avatar",
			maxCount: 1,
		},
		{
			name: "coverImage",
			maxCount: 1,
		},
	]),
	register,
);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/change-password").post(verifyJWT, changePass);
router.route("/refreshtokens").post(refreshToken);

router
	.route("/update-avatar")
	.patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
	.route("/update-coverImage")
	.patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/update-user").patch(verifyJWT, updateAccountData);

export default router;
