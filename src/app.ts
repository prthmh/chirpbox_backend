import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Social media Backend");
});

app.get("/get", (req, res) => {
  res.send("Hi");
});

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import postRouter from "./routes/post.routes";

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

export { app };
