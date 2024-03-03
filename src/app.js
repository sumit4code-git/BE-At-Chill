import express from "express";
import {REQUEST_SIZE_LIMIT} from "./constants.js";
import cors from "cors";
import { User } from "./models/user.models.js";

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:REQUEST_SIZE_LIMIT}))
app.use(express.urlencoded({extended:true,limit:REQUEST_SIZE_LIMIT}))
app.use(express.static("public"))

console.log("asjs")
// routes import
import userRouter from "./routes/user.router.js";
app.get("/",function (req,res){
    res.send("Helloe")
});
app.use("/api/v1/users", userRouter)

export { app } 