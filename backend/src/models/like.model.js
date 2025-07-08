//by,to(post)
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
	{
		likedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		likedItem: {
			type: mongoose.Schema.Types.ObjectId,
			refPath: "onModel", // <- key point
		},
		onModel: {
			type: String,
			required: true,
			enum: ["Post", "Reply"],
		},
	},
	{
		timestamps: true,
	},
);

export const Like = mongoose.model("Like", likeSchema);
