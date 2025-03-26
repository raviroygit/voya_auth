import mongoose from "mongoose";
import log from "../utils/logger";
import dotenv from "dotenv";
import { loadEncryptionKey } from "../utils/encryption";
dotenv.config();


const MONGO_URI = process.env.MONGO_URI ||"";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      maxPoolSize: 10, // ✅ Limit concurrent connections
      socketTimeoutMS: 30000, // ✅ Close inactive connections
      serverSelectionTimeoutMS: 30000, // ✅ Timeout if MongoDB is unresponsive
    });
    

    log.info(`🟢 MongoDB Connected: ${MONGO_URI}`);
        await loadEncryptionKey();
    
  } catch (error) {
    log.error("❌ MongoDB Connection Error", error);
    process.exit(1); // Exit process if DB connection fails
  }
};