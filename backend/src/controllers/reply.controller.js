import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Reply } from '../models/reply.model.js';
import { Like } from '../models/like.model.js';
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

// addReply
const addReply = asyncHandler(async(req,res)=>{
    /* 
        1. get content and postId
        2. get media if any and upload media
        3. create reply
        4. return res
    */
   const { content,postId } = req.body;
    const mediaLocalPath = req.files?.map((item) => item?.path) || [];
    const user = req.user;
   
    if (!(content&&postId)) throw new ApiError(400, "Content and Post are required");
   
    let media;
    if (mediaLocalPath.length) {
        media = await Promise.all(
            mediaLocalPath.map(async (path) => {
                const uploaded = await uploadOnCloudinary(path);
                return { mediaUrl: uploaded.url };
            }),
        );
    }
   
    const reply = await Reply.create({
        post : postId,
        content,
        media: media || undefined,
        owner: user._id,
    });
    if (!reply) throw new ApiError(401, "Cant create the reply");
   
    return res
        .status(200)
        .json(new ApiResponse(201, reply, "Reply created successfully"));
})

// getReplies
const getReplies = asyncHandler(async(req,res)=>{
    /* 
        1. get postId to load the replies
        2. load the replies
        3. each contains likes and reply
        4. return data
    */
   const { postId } = req.params;
    const { page = 1, limit = 15 } = req.query;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy: -1,
    };
   
    const pipeline = [
        {
            $match: {
                post: postId,
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
            },
        },
    ];
   
    const replies = await Reply.aggregatePaginate(
        Reply.aggregate(pipeline),
        options,
    );
   
    if (!replies) throw new ApiError(404, "No replies yet");
   
    return res
        .status(200)
        .json(new ApiResponse(200, replies.docs, "Replies fetched successfully"));
   
})

// updateReply
const updateReply = asyncHandler(async(req,res)=>{
    /* 
        1. get the reply id
        2. find the reply and update the content
		3. filter out the media changed if any
		4. update the media
		5. return the res
    */
   const { replyId, content, removeMedia } = req.body;
   if (!replyId) throw new ApiError(400, "Reply ID is required");

    const mediaLocalPath = req.files?.map((item) => item?.path) || [];
    const data = {};
   
    const oldReply = await Reply.findById(replyId);
    if (!oldReply) throw new ApiError(404, "Reply not found");
   
    let keep;
    if (Array.isArray(removeMedia) && removeMedia.length) {
        keep = oldReply.media.filter(
            (obj) => !removeMedia.includes(obj.mediaUrl),
        );
        await Promise.all(
            removeMedia.map(async (path) => {
                await deleteOnCloudinary(path);
            }),
        );
    } else {
        keep = oldReply.media.filter((obj) => obj.mediaUrl !== removeMedia);
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
   
    const reply = await Reply.findByIdAndUpdate(
        replyId,
        {
            $set: data,
        },
        { new: true },
    );
   
    if (!reply) throw new ApiError(404, "Error updating the reply");
   
    return res
        .status(200)
        .json(new ApiResponse(200, reply, "Reply updated successfully"));
})

// deleteReply
const deleteReply = asyncHandler(async(req,res)=>{
    /* 
        1. get replyId
        2. delete media if any
        3. delete likes records
        4. delete reply
        5. return res
    */

        const { replyId } = req.body;
        if (!replyId) throw new ApiError(400, "Reply ID is required");


	const reply = await Reply.findByIdAndDelete(replyId);
	if (!reply) throw new ApiError(404, "Reply not found.");

	const likes = await Like.aggregate([
		({
			$match: {
				likedItem: replyId,
                onModel : "Reply"
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

	if (reply.media.length) {
		const del = await Promise.all(
			reply.media.map(async (ary) => {
				await deleteOnCloudinary(ary.mediaUrl);
			}),
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Reply deleted successfully"));

})

export {addReply,getReplies,updateReply,deleteReply}