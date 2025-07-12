import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { generateAndSetTokens } from "../utils/genrateTokens.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//NOTE - register user
const register = asyncHandler(async (req, res) => {
	const { username, email, password, fullName } = req.body;
	const avatarLocalPath = req.files?.avatar[0]?.path;

	let coverImageLocalPath;
	if (
		req.files &&
		Array.isArray(req.files.coverImage) &&
		req.files.coverImage.length > 0
	)
		coverImageLocalPath = req.files.coverImage[0].path;

	if (
		[username, email, password, fullName].some(
			(field) => field.trim() === "",
		)
	)
		throw new ApiError(400, "all fields are required");

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new ApiError(409, "User with email or username already exists");
	}

	if (!avatarLocalPath) throw new ApiError(400, "Avatar required");

	const avatar = await uploadOnCloudinary(avatarLocalPath);
	const coverImage = await uploadOnCloudinary(coverImageLocalPath);
	if (!avatar) throw new ApiError(400, "Error uploading avatar");

	const hashed = await bcrypt.hash(password, 10);

	const createUser = await User.create({
		username,
		email,
		fullName,
		password: hashed,
		avatar: avatar.url,
		coverImage: coverImage.url || undefined,
	});
	if (!createUser) throw new ApiError(400, "Error creating user");
	const { accessToken, refreshToken } =
		await generateAndSetTokens(createUser);
	const options = {
		httpOnly: true,
		secure: true,
	};
	const safeUser = await User.findById(createUser._id).select(
		"-password -refreshToken",
	);

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(new ApiResponse(200, safeUser, "User created successfully"));
});

//NOTE - login user
const login = asyncHandler(async (req, res) => {
	/*
		1. take and validate the data
		2. check user exists
		3. validate user
		4. grant access
	*/

	const { username, email, password } = req.body;
	if (!((username || email) && password))
		throw new ApiError(400, "all feilds are required");

	const user = await User.findOne({
		$or: [{ email }, { username }],
	});

	if (!user) throw new ApiError(400, "username or password does not exist");

	if (!bcrypt.compare(password, user.password))
		throw new ApiError(400, "Incorrect password");

	const { accessToken, refreshToken } = await generateAndSetTokens(user);

	const safeUser = await User.findById(user._id).select(
		"-password -refreshToken",
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(new ApiResponse(200, safeUser, "Logged in successfully"));
});

//NOTE - change user password
const changePass = asyncHandler(async (req, res) => {
	/* 
		1. get and validate user
		2. validate pass
		3. update pass
		4. return response
	*/
	const { currentPassword, newPassword } = req.body;
	const { _id: userId } = req.user;

	if (!(currentPassword && newPassword))
		throw new ApiError(400, "Both passwords are required");
	if (currentPassword === newPassword)
		throw new ApiError(
			400,
			"New password cant be same as the old password",
		);
	const user = await User.findById(userId);

	if (!bcrypt.compare(user.password, currentPassword))
		throw new ApiError(401, "Incorrect password");
	const hashed = await bcrypt.hash(newPassword, 10);
	const safeUser = await User.findByIdAndUpdate(
		userId,
		{
			$set: {
				password: hashed,
			},
		},
		{
			new: true,
		},
	).select("-password -refreshToken");

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Password updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
	/* 
		1.get new avatar
		2.delete old on cloudinary
		3.update user
		4.return updated user
	*/
	const avatarLocalPath = req.file?.path;
	const user = req.user;

	if (!avatarLocalPath) throw new ApiError(400, "avatar required");
	await deleteOnCloudinary(user.avatar);

	const avatar = await uploadOnCloudinary(avatarLocalPath);
	if (!avatar) throw new ApiError(400, "avatar required");

	const safeUser = await User.findByIdAndUpdate(
		user._id,
		{
			$set: {
				avatar: avatar.url,
			},
		},
		{ new: true },
	);

	return res
		.status(200)
		.json(new ApiResponse(200, safeUser, "Avatar changed"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
	/* 
		1.get new coverImage
		2.delete old on cloudinary
		3.update user
		4.return updated user
	*/
	const coverImageLocalPath = req.file?.path;
	const user = req.user;

	if (!coverImageLocalPath) throw new ApiError(400, "coverImage required");
	await deleteOnCloudinary(user.coverImage);

	const coverImage = await uploadOnCloudinary(coverImageLocalPath);
	if (!coverImage) throw new ApiError(400, "Cover Image required");

	const safeUser = await User.findByIdAndUpdate(
		user._id,
		{
			$set: {
				coverImage: coverImage.url,
			},
		},
		{ new: true },
	);

	return res
		.status(200)
		.json(new ApiResponse(200, safeUser, "cover Image changed"));
});

const logout = asyncHandler(async (req, res) => {
	/* 
		1.remove cookies
		2.remove the refToken
		3.send response
	*/
	const user = req.user;

	await User.findByIdAndUpdate(user._id, {
		$set: {
			refreshToken: undefined,
		},
	});

	return res
		.status(200)
		.clearCookie("accessToken")
		.clearCookie("refreshToken")
		.json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
	/*  
		1. validate the user by refToken
		2. genrate new tokens 
		3. update user
		4. update users
	*/
	const token =
		req.cookies?.refreshToken ||
		req.header("Authorization")?.replace("Bearer ", "");

	if (!token) throw new ApiError(401, "Unauthorized request");

	const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

	const user = await User.findById(decodedToken.userId).select(
		"-password -refreshToken",
	);

	if (!user) throw new ApiError(404, "Invalid token");

	const { accessToken, refreshToken } = await generateAndSetTokens(user);

	const options = {
		httpOnly: true,
		secured: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(new ApiResponse(200, user, "Tokens refreshed"));
});

const getUser = asyncHandler(async (req, res) => {
	/*  
		1. get username from params
		2. isValidUser
		3. get all userInfo 
		   (i.e, username,fullName,bio,avatar,coverImage,followers,following)
		4. return all data
	*/
	const { username } = req.params;

	const user = await User.aggregate([
		{
			$match: {
				username: username,
			},
		},
		{
			$lookup: {
				from: "followers",
				localField: "_id",
				foreignField: "followedTo",
				as: "followers",
			},
		},
		{
			$addFields: {
				isFollowing: {
					$in: [
						req.user._id,
						"$followers.followedBy",
					],
				},
			},
		},
		{
			$lookup: {
				from: "followers",
				localField: "_id",
				foreignField: "followedBy",
				as: "following",
			},
		},
		{
			$project: {
				username: 1,
				fullName: 1,
				bio: 1,
				avatar: 1,
				coverImage: 1,
				followers: { $size: "$followers" },
				following: { $size: "$following" },
				isFollowing : 1
			},
		},
	]);

	if (!user) throw new ApiError(404, "User not found.");

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User details fetched successfully."));
});

const updateAccountData = asyncHandler(async (req, res) => {
	/* 
		1. get fields to update
		2. validate the fiedls 
		3. update the user
		4. return updated user 
	*/
	const { username, email, fullName, bio } = req.body;
	const user = req.user;

	const data = {};
	if (username) data.username = username;
	if (email) data.email = email;
	if (fullName) data.fullName = fullName;
	if (bio) data.bio = bio;

	if (!Object.keys(data).length === 0)
		throw new ApiError(400, "Can't update the user. No data provided");

	const safeUser = await User.findByIdAndUpdate(
		user._id,
		{
			$set: data,
		},
		{
			new: true,
		},
	).select("-password -refreshToken");

	if (!safeUser) throw new ApiError(404, "Error updating user.");

	return res
		.status(200)
		.json(new ApiResponse(200, safeUser, "User data updated."));
});

export {
	register,
	login,
	changePass,
	updateAvatar,
	updateCoverImage,
	logout,
	refreshToken,
	getUser,
	updateAccountData
};
