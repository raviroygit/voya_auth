import crypto from "crypto";
import { EncryptionKey } from "../models/encryptionKey.model";

// Global variable to store the encryption key after loading it from MongoDB
let ENCRYPTION_KEY: Buffer | null = null;
const IV_LENGTH = 16;

/**
 * Load the encryption key from MongoDB, or generate and store it if it doesn't exist.
 */
export async function loadEncryptionKey(): Promise<void> {
  try {
    let keyRecord = await EncryptionKey.findOne();

    if (!keyRecord) {
      // Generate a new encryption key and store it in MongoDB
      const newKey = crypto.randomBytes(32).toString("hex");
      keyRecord = await EncryptionKey.create({ key: newKey });
      console.log("🔑 New encryption key generated and stored in MongoDB.");
    }

    ENCRYPTION_KEY = Buffer.from(keyRecord.key, "hex");
    console.log("🔑 Encryption key loaded from MongoDB.");
  } catch (error) {
    console.error("Error loading encryption key from MongoDB:", error);
    process.exit(1); // Exit the process if key loading fails
  }
}

/**
 * Encrypt a given text.
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("Encryption key not loaded");

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypt a given encrypted string.
 */
export function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("Encryption key not loaded");

  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift()!, "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  
  return decrypted.toString();
}
