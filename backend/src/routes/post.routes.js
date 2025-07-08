import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { addPost, deletePost,getPosts, updatePost } from '../controllers/post.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router()

router.use(verifyJWT)

router.route("/add").post(
    upload.array("media",5),
    addPost
)
router.route("/delete").delete(deletePost)
router.route("/:username").get(getPosts)
router.route("/update").patch(upload.array("media",5),updatePost)

export default router