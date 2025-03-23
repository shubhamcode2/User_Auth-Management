import mongoose from "mongoose";

const ConnectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI})`);

        console.log(`Connected to MongoDB at ${connectionInstance.connection.host}`);

    } catch (error) {

        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default ConnectDB;