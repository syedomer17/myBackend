import config from "config";
import mongoose from "mongoose";

const dbURL : string = config.get<string>("DB_URL");

const dbConnect = async () => {
    try {
        await mongoose.connect(dbURL);
        console.log("DB connected successfully!")
    } catch (error) {
        console.log(error)
    }
}
dbConnect();

