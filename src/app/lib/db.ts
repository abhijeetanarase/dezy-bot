import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
}

let cachedConnection: Promise<typeof mongoose> | null = null;

export default async function dbConnect() {
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        cachedConnection = mongoose.connect(MONGO_URI!);
        await cachedConnection;
        console.log("MongoDB connected successfully");
        return cachedConnection;
    } catch (error) {
        cachedConnection = null;
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}
