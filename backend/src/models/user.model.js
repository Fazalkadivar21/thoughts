import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			required: true,
		},
		coverImage: {
			type: String,
		},
		bio: {
			type: String,
		},
		dob: {
			type: Date,
		},
		refreshToken: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

export const User = mongoose.model("User", userSchema);

