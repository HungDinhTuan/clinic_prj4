import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

/**
 * Upload a single file buffer to Cloudinary using streaming
 * @param {Buffer} fileBuffer - File buffer from multer memory storage
 * @param {String} fileName - Original file name
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise} - Upload result with secure_url
 */
export const uploadToCloudinary = (fileBuffer, fileName, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                public_id: fileName.split('.')[0],
                ...options
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Convert buffer to stream using streamifier and pipe to cloudinary
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

/**
 * Upload multiple file buffers to Cloudinary using streaming
 * @param {Array} files - Array of file objects from multer (with buffer property)
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise} - Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, options = {}) => {
    const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `file-${Date.now()}-${index}`,
                    ...options
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Convert buffer to stream using streamifier and pipe to cloudinary
            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    });

    return Promise.all(uploadPromises);
};
