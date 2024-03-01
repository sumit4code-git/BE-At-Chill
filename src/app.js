import express from "express";
import {REQUEST_SIZE_LIMIT} from "./constants.js";
import cors from "cors";

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:REQUEST_SIZE_LIMIT}))
app.use(express.urlencoded({extended:true,limit:REQUEST_SIZE_LIMIT}))
app.use(express.static("public"))


export { app }