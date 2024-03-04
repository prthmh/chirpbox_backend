import { Router } from "express";
import verifyToken from "../middleware/verify.middleware";
import { createPost } from "../controllers/post.controller";

const postRouter = Router();

postRouter.post("/", verifyToken, createPost);

export default postRouter;
