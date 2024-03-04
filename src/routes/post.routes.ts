import { Router } from "express";
import verifyToken from "../middleware/verify.middleware";
import {
  createPost,
  deletePostHandler,
  dislikePostHandler,
  editPostHandler,
  getAllPostsHandler,
  getAllPostsOfUserHandler,
  getPostByIdHandler,
  likePostHandler,
} from "../controllers/post.controller";

const postRouter = Router();

postRouter.get("/", getAllPostsHandler);
postRouter.post("/", verifyToken, createPost);
postRouter.post("/edit/:postId", verifyToken, editPostHandler);
postRouter.get("/:postId", getPostByIdHandler);
postRouter.delete("/:postId", verifyToken, deletePostHandler);
postRouter.get("/user/:username", getAllPostsOfUserHandler);
postRouter.post("/like/:postId", verifyToken, likePostHandler);
postRouter.post("/dislike/:postId", verifyToken, dislikePostHandler);

export default postRouter;
