import { Request, Response } from "express";
import { Post } from "../models/post.model";
import UserRequest from "../types";
import mongoose from "mongoose";

async function createPost(req: UserRequest, res: Response) {
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

//edit post /api/posts/edit/:postId
async function editPostHandler(req: UserRequest, res: Response) {
  try {
    const { username } = req.user!;
    const postId = req.params.postId;
    const { postData } = req.body;

    if (!postData) {
      return res.status(400).json({ errorMsg: "No post data" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ errorMsg: "Post not found" });
    }

    if (post.username !== username) {
      return res.status(400).json({
        errorMsg:
          "Cannot edit a post that doesn't belong to the logged-in User",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, postData, {
      new: true,
    });
    const allPosts = await Post.find({}).populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });
    res.status(200).json({ updatedPost, posts: allPosts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in editing post" });
  }
}

//delete post /api/posts/:postId
async function deletePostHandler(req: UserRequest, res: Response) {
  try {
    const { username } = req.user!;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ errorMsg: "No post" });
    }
    if (post.username !== username) {
      return res.status(400).json({
        errorMsg:
          "Cannot edit a post that doesn't belong to the logged-in User",
      });
    }

    await Post.findByIdAndDelete(postId);

    const allPosts = await Post.find({}).populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });
    return res.status(201).json({ posts: allPosts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in deleteing post" });
  }
}

//get all posts /api/posts
async function getAllPostsHandler(req: UserRequest, res: Response) {
  try {
    const allPosts = await Post.find({}).populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });
    return res.status(200).json({ posts: allPosts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in getting all post" });
  }
}

//get post by the post id /api/posts/:postId
async function getPostByIdHandler(req: UserRequest, res: Response) {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId).populate({
      path: "user",
      select: "_id fisrtName lastName username profilePic",
    });

    if (!post) {
      return res.status(404).json({ errorMsg: "No post found" });
    }

    return res.status(200).json({ post });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in getting post" });
  }
}

//get all posts of user /api/posts/user/:username
async function getAllPostsOfUserHandler(req: UserRequest, res: Response) {
  try {
    const username = req.params.username;

    const allPostsOfUser = await Post.find({ username }).populate({
      path: "user",
      select: "_id fisrtName lastName username profilePic",
    });

    return res.status(200).json({ posts: allPostsOfUser });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in getting posts of user" });
  }
}

//like a post /api/posts/like/:postId
async function likePostHandler(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ errorMsg: "No post found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (post.likes.likedBy.includes(userObjectId)) {
      return res.status(400).json({ errorMsg: "Post is alresy liked" });
    }

    post.likes.likedBy.push(userObjectId);
    post.likes.likeCount = post.likes.likedBy.length;

    await post.save();

    const allPosts = await Post.find({}).populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });
    return res.status(201).json({ posts: allPosts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in getting posts of user" });
  }
}

//dislike a post api/posts/dislike/:postId
async function dislikePostHandler(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ errorMsg: "No post found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const userIndexInLikesAry = post.likes.likedBy.indexOf(userObjectId);

    if (userIndexInLikesAry !== -1) {
      return res
        .status(400)
        .json({ errorMsg: "Cannot dislike a liked post" });
    }

    post.likes.likedBy = post.likes.likedBy.filter(
      (item) => item !== userObjectId
    );
    post.likes.likeCount = post.likes.likedBy.length;

    await post.save();

    const posts = await Post.find({}).populate({
      path: "user",
      select: "_id firstName lastName username profilePic",
    });

    return res.status(201).json({ posts });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in getting posts of user" });
  }
}

export {
  createPost,
  editPostHandler,
  deletePostHandler,
  getAllPostsHandler,
  getPostByIdHandler,
  getAllPostsOfUserHandler,
  likePostHandler,
  dislikePostHandler,
};
