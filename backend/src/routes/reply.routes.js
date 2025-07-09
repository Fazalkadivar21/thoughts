import { Router } from "express";
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from "../middleware/auth.middleware.js";
import {addReply,getReplies,updateReply,deleteReply} from "../controllers/reply.controller.js"

const router = Router()

router.use(verifyJWT)

router.route("/add").post(upload.array("media",5),addReply)
router.route("/:postId").get(getReplies)
router.route("/update").patch(upload.array("media",5),updateReply)
router.route("/delete").delete(deleteReply)

export default router