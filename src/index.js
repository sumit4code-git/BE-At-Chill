import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv"

dotenv.config({
    path: '.env'
})
import express from "express";
const app = express();

(async ()=> {
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error)=> {
        console.log("Application not able to connect with Express", error)
        throw error
    })

    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`App is lsitening on port${process.env.PORT}`)
    })
} catch(error){
    console.log("Error with connecting MongoDb ",error)
    throw error
}
})()
