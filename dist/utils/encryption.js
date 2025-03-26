"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEncryptionKey = loadEncryptionKey;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const encryptionKey_model_1 = require("../models/encryptionKey.model");
// Global variable to store the encryption key after loading it from MongoDB
let ENCRYPTION_KEY = null;
const IV_LENGTH = 16;
/**
 * Load the encryption key from MongoDB, or generate and store it if it doesn't exist.
 */
function loadEncryptionKey() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let keyRecord = yield encryptionKey_model_1.EncryptionKey.findOne();
            if (!keyRecord) {
                // Generate a new encryption key and store it in MongoDB
                const newKey = crypto_1.default.randomBytes(32).toString("hex");
                keyRecord = yield encryptionKey_model_1.EncryptionKey.create({ key: newKey });
                console.log("🔑 New encryption key generated and stored in MongoDB.");
            }
            ENCRYPTION_KEY = Buffer.from(keyRecord.key, "hex");
            console.log("🔑 Encryption key loaded from MongoDB.");
        }
        catch (error) {
            console.error("Error loading encryption key from MongoDB:", error);
            process.exit(1); // Exit the process if key loading fails
        }
    });
}
/**
 * Encrypt a given text.
 */
function encrypt(text) {
    if (!ENCRYPTION_KEY)
        throw new Error("Encryption key not loaded");
    let iv = crypto_1.default.randomBytes(IV_LENGTH);
    let cipher = crypto_1.default.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}
/**
 * Decrypt a given encrypted string.
 */
function decrypt(text) {
    if (!ENCRYPTION_KEY)
        throw new Error("Encryption key not loaded");
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto_1.default.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
}
