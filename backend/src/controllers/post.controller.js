import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";

//addPost
const addPost = asyncHandler(async (req, res) => {
	/* 
        1. get the data
        2. validate data
        3. create post
        4. return the post
    */
	const { content } = req.body;
	const mediaLocalPath = req.files?.map((item) => item?.path) || [];
	const user = req.user;

	if (!content) throw new ApiError(400, "Content is required");

	let media;
	if (mediaLocalPath.length) {
		media = await Promise.all(
			mediaLocalPath.map(async (path) => {
				const uploaded = await uploadOnCloudinary(path);
				return { mediaUrl: uploaded.url };
			}),
		);
	}

	const post = await Post.create({
		content,
		media: media || undefined,
		owner: user._id,
	});
	if (!post) throw new ApiError(401, "Cant create the post");

	return res
		.status(200)
		.json(new ApiResponse(201, post, "Post created successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
	/* 
        1. get post id
        2. find the post
		3. delete likes records
        4. media ? delete : return
        5. return res
    */

	const { postId } = req.body;
	if (!postId) throw new ApiError(400, "Post ID is required");


	const post = await Post.findByIdAndDelete(postId);
	if (!post) throw new ApiError(404, "Post not found.");

	const likes = await Like.aggregate([
		({
			$match: {
				likedItem: postId,
				onModel : "Post"
			},
		},
		{
			$project: {
				_id: 1,
			},
		}),
	]);
	if (likes.length > 0) {
		await Like.deleteMany({
			_id: {
				$in: likes,
			},
		});
	}

	if (post.media.length) {
		const del = await Promise.all(
			post.media.map(async (ary) => {
				await deleteOnCloudinary(ary.mediaUrl);
			}),
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getPosts = asyncHandler(async (req, res) => {
	/*
		1. get the userId
		2. get the post
		3. get likes reply
		4. send the paginated posts
		5. return the res
	*/

	const { username } = req.params;
	const { page = 1, limit = 15 } = req.query;
	const options = {
		page: parseInt(page),
		limit: parseInt(limit),
		sortBy: -1,
	};

	const user = await User.findOne({
		username: { $regex: username, $options: "i" },
	});
	if (!user) throw new ApiError(404, "Invalid username");

	const pipeline = [
		{
			$match: {
				owner: user._id,
			},
		},
		{
			$lookup: {
				from: "likes",
				foreignField: "likedItem",
				localField: "_id",
				as: "likes",
			},
		},
		{
			$lookup: {
				from: "replys",
				foreignField: "post",
				localField: "_id",
				as: "replies",
			},
		},
		{
			$lookup: {
				from: "users",
				foreignField: "_id",
				localField: "owner",
				as: "owner",
				pipeline: [
					{
						$project: {
							username: 1,
							avatar: 1,
							fullName: 1,
						},
					},
				],
			},
		},
		{
			$unwind: "$owner",
		},
		{
			$project: {
				_id: 1,
				content: 1,
				owner: 1,
				media: 1,
				likes: { $size: "$likes" },
				replies: { $size: "$replies" },
			},
		},
	];

	const posts = await Post.aggregatePaginate(
		Post.aggregate(pipeline),
		options,
	);

	if (!posts) throw new ApiError(404, "No posts yet");

	return res
		.status(200)
		.json(new ApiResponse(200, posts.docs, "Posts fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
	/* 
		1. get the post id 
		2. find the post and update the content
		3. filter out the media changed if any
		4. update the media
		5. return the res
		*/
	const { postId, content, removeMedia } = req.body;
	if (!postId) throw new ApiError(400, "Post ID is required");

	const mediaLocalPath = req.files?.map((item) => item?.path) || [];
	const data = {};

	const oldPost = await Post.findById(postId);
	if (!oldPost) throw new ApiError(404, "Post not found");

	let keep;
	if (Array.isArray(removeMedia) && removeMedia.length) {
		keep = oldPost.media.filter(
			(obj) => !removeMedia.includes(obj.mediaUrl),
		);
		await Promise.all(
			removeMedia.map(async (path) => {
				await deleteOnCloudinary(path);
			}),
		);
	} else {
		keep = oldPost.media.filter((obj) => obj.mediaUrl !== removeMedia);
		await deleteOnCloudinary(removeMedia);
	}

	let media;
	if (mediaLocalPath.length) {
		media = await Promise.all(
			mediaLocalPath.map(async (path) => {
				const up = await uploadOnCloudinary(path);
				return {
					mediaUrl: up.url,
				};
			}),
		);
	}

	if (content.trim()) data.content = content;
	if (media && media.length > 0 && mediaLocalPath.length ) data.media = [...keep, ...media] 
    else data.media = [...keep]

	const post = await Post.findByIdAndUpdate(
		postId,
		{
			$set: data,
		},
		{ new: true },
	);

	if (!post) throw new ApiError(404, "Error updating the post");

	return res
		.status(200)
		.json(new ApiResponse(200, post, "Post updated successfully"));
});

export { addPost, deletePost, getPosts, updatePost };
