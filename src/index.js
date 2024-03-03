import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import dotenv from "dotenv"
import { app } from "./app.js"

dotenv.config({
    path: '.env'
})

;(async ()=> {
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
