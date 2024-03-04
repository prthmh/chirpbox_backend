import { Router } from "express";
import {
  addPostToBookmark,
  editUser,
  followUserHandler,
  getAllBookmarkPost,
  getAllUsers,
  getUserByUsername,
  removePostFromBookmark,
  unfollowUserHandler,
} from "../controllers/user.controller";
import verifyToken from "../middleware/verify.middleware";

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/bookmark", verifyToken, getAllBookmarkPost);
userRouter.get("/:username", getUserByUsername);
userRouter.post("/edit", verifyToken, editUser);
userRouter.post("/bookmark/:postId", verifyToken, addPostToBookmark);
userRouter.post(
  "/remove-bookmark/:postId",
  verifyToken,
  removePostFromBookmark
);
userRouter.post("/unfollow/:unFollowUserId", verifyToken, unfollowUserHandler);
userRouter.post("/follow/:followUserId", verifyToken, followUserHandler);

export default userRouter;
