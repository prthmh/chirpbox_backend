import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  profilePic: string;
  bannerImg: string;
  bio: string;
  bioLink: string;
  acceptTermsCond?: boolean;
  followers: Array<mongoose.Types.ObjectId>;
  following: Array<mongoose.Types.ObjectId>;
  bookmarks: Array<mongoose.Types.ObjectId>;
  comparePassword(userPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String, //cloudinary url
      default: "",
    },
    bannerImg: {
      type: String, //cloudinary url
      default: "",
    },
    bio: {
      type: String,
    },
    bioLink: {
      type: String,
    },
    acceptTermsCond: {
      type: Boolean,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<UserDocument>("User", userSchema);
