import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect from "./db/index.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
// import followerRouter from "./routes/follower.routes.js"
import likeRouter from "./routes/like.routes.js"
// import replyRouter from "./routes/reply.routes.js"

const app = express();
dotenv.config();
connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CORS,
  })
);

app.use("/api/v1/users",userRouter)
app.use("/api/v1/posts",postRouter)
// app.use("/api/v1/followers",followerRouter)
app.use("/api/v1/likes",likeRouter)
// app.use("/api/v1/replies",replyRouter)

export default app;