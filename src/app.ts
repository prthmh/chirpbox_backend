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
    res.send("Hi")
})

export { app };
