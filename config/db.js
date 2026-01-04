import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectionUrl = process.env.MONGODB_URI;
console.log("🚀 ~ connectionUrl:", connectionUrl);

const connecDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.set("strictPopulate", false);
    await mongoose.connect(connectionUrl);
    console.log("MongoDB Connection Succesfully");
  } catch (error) {
    console.error("MongoDB Connection Fail");
    console.error(error);
    process.exit(1);
  }
};

export default connecDB;
