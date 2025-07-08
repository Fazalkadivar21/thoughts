import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//addlike
const toggleLikes = asyncHandler(async (req, res) => {
	/* 
        1. get post/reply Id
        2. add like doc
        3. return the res
    */

	const { postId, replyId } = req.body;
	const user = req.user;

	const likedItem = postId || replyId;
	const onModel = postId ? "Post" : "Reply";

	const existingLike = await Like.findOne({
		likedBy: user._id,
		likedItem,
		onModel,
	});

	let action = "";

	if (existingLike) {
		// Unlike
		await existingLike.deleteOne();
		action = "unLiked";
	} else {
		// Like
		await Like.create({
			likedBy: user._id,
			likedItem,
			onModel,
		});
		action = "Liked";
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, `${action} successfully`));
});

export { toggleLikes };
