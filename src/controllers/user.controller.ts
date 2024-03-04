import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

//get user /api/users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUser = await User.find({}, "-password").populate({
      path: "followers following",
      select: "_id firstName lastName username profileImg",
    });

    return res.status(200).json({ users: allUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errorMsg: "Error in fetching all users" });
  }
};

//get user by username /api/users/:username
async function getUserByUsername(req: Request, res: Response) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }, "-password").populate({
      path: "followers following",
      select: "_id firstName lastName username profileImg",
    });

    if (!user) {
      return res.status(404).json({ errorMsg: "No user found." });
    }

    return res.status(200).json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errorMsg: "Error in fetching user" });
  }
}

//edit user /api/user/edit
async function editUser(req: Request, res: Response) {
  try {
    const data = req.body.userData;
    console.log(data);
    const user = await User.findById(data._id);

    if (!user) {
      return res.status(404).json({ errorMsg: "User does not exist" });
    }

    if (data.username !== user.username) {
      return res.status(400).json({ errorMsg: "User can not be changed" });
    }
    const newUserData = { ...data };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      newUserData.password = await bcrypt.hash(data.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(data._id, newUserData, {
      new: true,
    })
      .select("-password")
      .populate({
        path: "followers following",
        select: "_id fisrtName lastName username profileImg",
      });

    res.status(200).json({ user: updatedUser });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in editing user" });
  }
}

interface UserRequest extends Request {
  user?: { _id?: string; username?: string };
}
// add post to bookmarks /api/users/bookmark/:postId
async function addPostToBookmark(req: UserRequest, res: Response) {
  const { _id: userId } = req.user!;
  const postId = req.params.postId;
  if (!postId || !userId) {
    return res.status(404).json({ errorMsg: "Incomplete info" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMsg: "User not found" });
    }

    //converting string to objectId
    const postIdAsObjectId: mongoose.Types.ObjectId =
      new mongoose.Types.ObjectId(postId);
    if (user.bookmarks.includes(postIdAsObjectId)) {
      return res.status(400).json({ errorMsg: "Post is already bookmarked" });
    }

    user.bookmarks.push(postIdAsObjectId);
    await user.save();

    return res.status(200).json({ bookmarks: user.bookmarks });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errorMsg: "Error in add post to bookmark" });
  }
}

//remove bookmarked posts  /api/users/remove-bookmark/:postId
async function removePostFromBookmark(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMsg: "User not found" });
    }
    //converting string to objectId
    const postIdAsObjectId: mongoose.Types.ObjectId =
      new mongoose.Types.ObjectId(postId);
    if (!user.bookmarks.includes(postIdAsObjectId)) {
      return res
        .status(400)
        .json({ errorMsg: "Post is not even bookmarked yet." });
    }

    const newBookmarks = user.bookmarks.filter(
      (item) => !item.equals(postIdAsObjectId)
    );
    user.bookmarks = newBookmarks;
    await user.save();

    return res.status(200).json({ bookmarks: user.bookmarks });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMesage: "Error in removnig post from bookmarks" });
  }
}

//get all the bookmarked posts /api/users/bookmark
async function getAllBookmarkPost(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const user = await User.findById(userId).populate({
      path: "bookmarks",
      populate: {
        path: "user",
        select: "_id username firstName lastName profilePic",
      },
    });
    console.log(user?.bookmarks);
    return res.status(200).json({ bookmarks: user?.bookmarks });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e,
      errorMsg: "Error in fetching all the bookmarked posts",
    });
  }
}

//follow user api/user/follow/:followUserId
async function followUserHandler(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const followUserId = req.params.followUserId;

    if (userId === followUserId) {
      return res.status(400).json({ errorMsg: "You can't follow yourself" });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, following: { $ne: followUserId } },
      { $addToSet: { following: followUserId } },
      { new: true }
    )
      .select("-password")
      .populate({
        path: "following followers",
        select: "_id username firstName lastName profilePic",
      });

    if (!user) {
      return res.status(400).json({ errorMsg: "User already followong" });
    }

    await User.findOneAndUpdate(
      {
        _id: followUserId,
        followers: { $ne: userId },
      },
      { $addToSet: { followers: userId } }
    );

    const allUsers = await User.find({}, "-password").populate({
      path: "following followers",
      select: "_id username firstName lastName profilePic",
    });

    return res.status(200).json({ user, users: allUsers });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in following user" });
  }
}

//unfollow user api/user/follow/:unFollowUserId
async function unfollowUserHandler(req: UserRequest, res: Response) {
  try {
    const { _id: userId } = req.user!;
    const unFollowUserId = req.params.unFollowUserId;

    if (userId === unFollowUserId) {
      return res.status(400).json({ errorMsg: "You can't unfollow yourself" });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, following: unFollowUserId },
      { $pull: { following: unFollowUserId } },
      { new: true }
    )
      .select("-password")
      .populate({
        path: "following followers",
        select: "_id username firstName lastName profilePic",
      });

    if (!user) {
      return res
        .status(400)
        .json({ errorMsg: "You do not follow the user you wish to unfollow" });
    }

    await User.findOneAndUpdate(
      { _id: unFollowUserId, followers: userId },
      { $pull: { followers: userId } }
    );

    const allUsers = await User.find({}, "-password").populate({
      path: "following followers",
      select: "_id username firstName lastName profilePic",
    });

    return res.status(200).json({ user, users: allUsers });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: e, errorMsg: "Error in unfollowing user" });
  }
}

export {
  getAllUsers,
  getUserByUsername,
  editUser,
  addPostToBookmark,
  removePostFromBookmark,
  getAllBookmarkPost,
  followUserHandler,
  unfollowUserHandler,
};
