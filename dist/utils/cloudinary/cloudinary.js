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
exports.getImageDetails = exports.deleteMultipleImages = exports.deleteImage = exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
/**
 * Upload a single image to Cloudinary
 * @param fileBuffer - Buffer of the image
 * @param folder - Cloudinary folder name
 * @returns {Promise<{ url: string, publicId: string }>} - Image URL & Public ID
 */
const uploadSingleImage = (fileBuffer, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "nxtgenai/" + folder }, (error, result) => {
            if (error)
                return reject(error);
            resolve({ url: (result === null || result === void 0 ? void 0 : result.secure_url) || "", publicId: (result === null || result === void 0 ? void 0 : result.public_id) || "" });
        });
        stream_1.Readable.from(fileBuffer).pipe(stream);
    });
});
exports.uploadSingleImage = uploadSingleImage;
/**
 * Upload multiple images to Cloudinary
 * @param fileBuffers - Array of image buffers
 * @param folder - Cloudinary folder name
 * @returns {Promise<{ url: string, publicId: string }[]>} - Array of image URLs
 */
const uploadMultipleImages = (fileBuffers, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.all(fileBuffers.map((buffer) => (0, exports.uploadSingleImage)(buffer, folder)));
});
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
const deleteImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.uploader.destroy(publicId, (error, result) => {
            if (error)
                return reject(error);
            resolve(result.result === "ok");
        });
    });
});
exports.deleteImage = deleteImage;
/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 * @returns {Promise<boolean[]>} - Array of deletion status
 */
const deleteMultipleImages = (publicIds) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.all(publicIds.map((id) => (0, exports.deleteImage)(id)));
});
exports.deleteMultipleImages = deleteMultipleImages;
/**
 * Get details of an image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns {Promise<any>} - Image details
 */
const getImageDetails = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        cloudinary_1.default.api.resource(publicId, (error, result) => {
            if (error)
                return reject(error);
            resolve(result);
        });
    });
});
exports.getImageDetails = getImageDetails;
