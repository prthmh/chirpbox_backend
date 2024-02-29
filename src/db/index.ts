import mongoose from "mongoose";

const DB_NAME = "socialmedia";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // console.log(
    //   `/n MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`
    // );
  } catch (error) {
    console.log("MONOGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
