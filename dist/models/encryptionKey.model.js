"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionKey = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const encryptionKeySchema = new mongoose_1.default.Schema({
    key: { type: String, required: true }
});
exports.EncryptionKey = mongoose_1.default.model("EncryptionKey", encryptionKeySchema);
