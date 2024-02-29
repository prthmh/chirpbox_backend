import mongoose from "mongoose";
import { envObj } from "../constants";

const MONGODB_URI = envObj.MONGODB_URI;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI, {
      dbName: "chirpbox",
    });
    if (connectionInstance) {
      console.log(`DB Connected succesfully`);
    }
  } catch (error) {
    console.log("MONOGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
