import mongoose, { Document } from "mongoose";

interface likeObj {
  likeCount: number;
  likedBy: mongoose.Types.ObjectId[];
  dislikedBy: mongoose.Types.ObjectId[];
}
interface PostDocument extends Document {
  content: string;
  mediaURL: string;
  mediaAlt: string;
  likes: likeObj;
  user: mongoose.Types.ObjectId;
  username: string;
}

const postSchema = new mongoose.Schema<PostDocument>(
  {
    content: {
      type: String,
      required: true,
    },
    mediaURL: {
      type: String,
      default: "",
    },
    mediaAlt: {
      type: String,
      default: "",
    },
    likes: {
      type: {
        likeCount: {
          type: Number,
          default: 0,
        },
        likedBy: {
          type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
          default: [],
        },
        dislikedBy: {
          type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
          default: [],
        },
      },
      default: {
        likeCount: 0,
        likedBy: [],
        dislikedBy: [],
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model<PostDocument>("Post", postSchema);
