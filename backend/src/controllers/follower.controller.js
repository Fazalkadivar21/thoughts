import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Follower} from "../models/follower.model.js";
import mongoose from "mongoose";

// toggleFollow
const toggleFollow = asyncHandler(async (req, res) => {
	const { userId, isFollowing } = req.body;
	const user = req.user;

	if (!userId) throw new ApiError(400, "user is required.");

	if (!isFollowing) {
		const follow = await Follower.create({
			followedBy: user._id,
			followedTo: userId,
		});
		if (!follow) throw new ApiError(400, "Error following user");

		return res
			.status(200)
			.json(new ApiResponse(200, follow, "Followed user successfully"));
	}

	await Follower.findOneAndDelete(
		await Follower.findOneAndDelete({
			followedBy: user._id,
			followedTo: userId,
		}),
	);

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Unfollowed user successfully"));
});

// getFollowers
const getFollowers = asyncHandler(async (req, res) => {
	/* 
		1. get the userid 
		2. search for the records where user is followedTo
		3. get the user list
		4. set flag isFollowing for current user
		  4.1 match the records and return a bool isFollowing (for the ease of frontend)
	*/

	const { requestedUserId } = req.body;
	const currentUserId = req.user._id;
	const { page = 1, limit = 15 } = req.query;

	if (!requestedUserId) throw new ApiError(400, "userId required");

	const options = {
		page: page,
		limit: limit,
	};

	const pipeline = [
		{
			$match: {
				followedTo: new mongoose.Types.ObjectId(requestedUserId),
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "followedBy",
				foreignField: "_id",
				as: "follower",
				pipeline: [
					{
						$project: {
							_id: 1,
							username: 1,
							fullName: 1,
							avatar: 1,
						},
					},
				],
			},
		},
		{
			$unwind: "$follower",
		},
		{
			$lookup: {
				from: "followers",
				let: { followerId: "$follower._id" }, // grab the follower's id
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: [
											"$followedBy",
											currentUserId,
										],
									},
									{ $eq: ["$followedTo", "$$followerId"] },
								],
							},
						},
					},
				],
				as: "isFollowingRecord",
			},
		},
		{
			$addFields: {
				isFollowing: { $gt: [{ $size: "$isFollowingRecord" }, 0] },
			},
		},
		{
			$project: {
				_id : 0,
				follower: 1,
				isFollowing: 1,
			},
		},
	];

	const followers = await Follower.aggregatePaginate(
		Follower.aggregate(pipeline),
		options,
	);

	if (!followers.totalDocs)
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "No followers found"));

	return res
		.status(200)
		.json(new ApiResponse(200, followers, "followers fetched"));
});

// getFollowing - exect same thing as followers
const getFollowing = asyncHandler(async (req, res) => {
	/* 
		1. get the userid 
		2. search for the records where user is followedBy
		3. get the user list
		4. set flag isFollowing for current user
		  4.1 match the records and return a bool isFollowing (for the ease of frontend)
	*/

	const { requestedUserId } = req.body;
	const currentUserId = req.user._id;
	const { page = 1, limit = 15 } = req.query;

	if (!requestedUserId) throw new ApiError(400, "userId required");

	const options = {
		page: page,
		limit: limit,
	};

	const pipeline = [
		{
			$match: {
				followedBy: new mongoose.Types.ObjectId(requestedUserId),
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "followedBy",
				foreignField: "_id",
				as: "following",
				pipeline: [
					{
						$project: {
							_id: 1,
							username: 1,
							fullName: 1,
							avatar: 1,
						},
					},
				],
			},
		},
		{
			$unwind: "$following",
		},
		{
			$lookup: {
				from: "followers",
				let: { followingId: "$following._id" }, // grab the follower's id
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: [
											"$followedBy",
											currentUserId,
										],
									},
									{ $eq: ["$followedTo", "$$followingId"] },
								],
							},
						},
					},
				],
				as: "isFollowingRecord",
			},
		},
		{
			$addFields: {
				isFollowing: { $gt: [{ $size: "$isFollowingRecord" }, 0] },
			},
		},
		{
			$project: {
				_id:0,
				following: 1,
				isFollowing: 1,
			},
		},
	];

	const following = await Follower.aggregatePaginate(
		Follower.aggregate(pipeline),
		options,
	);

	if (!following.totalDocs)
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Not following anyone"));

	return res
		.status(200)
		.json(new ApiResponse(200, following, "followings fetched"));
});

export { toggleFollow, getFollowers, getFollowing };
