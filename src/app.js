import express from "express";
import { REQUEST_SIZE_LIMIT } from "./constants.js";
import cors from "cors";
import { User } from "./models/user.models.js";

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());
// routes import
import userRouter from "./routes/user.router.js";
import cookieParser from "cookie-parser";
import commentRouter from "./routes/comment.routes.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", commentRouter);
export { app };