import { Readable } from "stream";
import cloudinary from "../../config/cloudinary";

/**
 * Upload a single image to Cloudinary
 * @param fileBuffer - Buffer of the image
 * @param folder - Cloudinary folder name
 * @returns {Promise<{ url: string, publicId: string }>} - Image URL & Public ID
 */
export const uploadSingleImage = async (fileBuffer: Buffer, folder: string):  Promise<{ url: string, publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder:"nxtgenai/"+folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result?.secure_url || "", publicId: result?.public_id || "" });
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param fileBuffers - Array of image buffers
 * @param folder - Cloudinary folder name
 * @returns {Promise<{ url: string, publicId: string }[]>} - Array of image URLs
 */
export const uploadMultipleImages = async (fileBuffers: Buffer[], folder: string): Promise<{ url: string, publicId: string }[]> => {
  return Promise.all(fileBuffers.map((buffer) => uploadSingleImage(buffer, folder)));
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result.result === "ok");
    });
  });
};

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 * @returns {Promise<boolean[]>} - Array of deletion status
 */
export const deleteMultipleImages = async (publicIds: string[]): Promise<boolean[]> => {
  return Promise.all(publicIds.map((id) => deleteImage(id)));
};

/**
 * Get details of an image from Cloudinary
 * @param publicId - Cloudinary public ID
 * @returns {Promise<any>} - Image details
 */
export const getImageDetails = async (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
