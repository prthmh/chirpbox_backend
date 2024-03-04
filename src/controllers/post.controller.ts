import { Request, Response } from "express";
import { Post } from "../models/post.model";

interface CreatePostRequest extends Request {
  user?: { _id?: string; username?: string };
}
async function createPost(req: CreatePostRequest, res: Response) {
  try {
    const { _id, username } = req.user!;
    if (!username) {
      return res.status(404).json({ errors: "No User" });
    }

    const postData = req.body;

    if (!postData) {
      return res.status(400).json({ errorMsg: "No post data" });
    }

    const post = await Post.create({ ...postData, username, user: _id });
    await post.populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });

    return res.status(201).json({ newPost: post });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ errorMsg: "Error in creating post", error: e });
  }
}


export { createPost };
