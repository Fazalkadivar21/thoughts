import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const replySchema = new mongoose.Schema({
	post: {
		type: mongoose.Schema.Types.ObjectId,
        ref:"Post"
	},
    content : {
        type:String,
        required:true
    },
    owner:{
		type: mongoose.Schema.Types.ObjectId,
        ref:"User"
	},
    media: [
			{
				mediaUrl: {
					type: String,
				},
			},
		],
},{
    timestamps:true,
});

replySchema.plugin(mongooseAggregatePaginate)

export const Reply = mongoose.model("Reply",replySchema)