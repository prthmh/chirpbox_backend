import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Request, Response } from "express";
import { envObj } from "../constants";
import bcrypt from "bcrypt";

const JWT_SECRET_KEY = envObj.JWT_SECRET_KEY;

export async function userSignup(req: Request, res: Response) {
  try {
    const { username, password, firstName, lastName, email } = req.body;
    if (
      [username, password, firstName, lastName, email].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "Some fields are empty" });
    }

    const isExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (isExistingUser) {
      return res.status(409).json({ error: "User Already exists" });
    }

    const user = await User.create({
      username,
      password,
      firstName,
      lastName,
      email,
    });

    const resUser = await User.findById(user._id).select("-password");

    const token = jwt.sign(
      {
        _id: resUser?._id,
        username: resUser?.username,
      },
      JWT_SECRET_KEY
    );

    return res.status(201).json({ createdUser: resUser, encodedToken: token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function userLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ errorMsg: "Fields missing" });
    }

    const resUser = await User.findOne({ username }).populate({
      path: "followers following",
      select: "_id firstName lastName username profileImg",
    });

    if (!resUser) {
      return res.status(404).json({ errorMsg: "User does not exists" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, resUser.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ errorMsg: "Password Incorrect" });
    }

    const foundUser = await User.findById(resUser._id).select("-password");
    const token = jwt.sign(
      {
        _id: foundUser?._id,
        username: foundUser?.username,
      },
      JWT_SECRET_KEY
    );

    return res.status(200).json({ foundUser, encodedToken: token });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ errorMsg: "Internal Server Error", error: e });
  }
}
