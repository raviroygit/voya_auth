import mongoose from "mongoose";

const encryptionKeySchema = new mongoose.Schema({
  key: { type: String, required: true }
});

export const EncryptionKey = mongoose.model("EncryptionKey", encryptionKeySchema);
