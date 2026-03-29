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
exports.extractS3Key = exports.uploadAndCleanup = exports.deleteFromS3 = exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../config"));
// Initialize S3 Client
const s3Client = new client_s3_1.S3Client({
    region: config_1.default.aws.region || 'us-east-1',
    credentials: {
        accessKeyId: config_1.default.aws.accessKeyId || '',
        secretAccessKey: config_1.default.aws.secretAccessKey || '',
    },
});
/**
 * Upload file to S3 bucket
 * @param filePath - Local file path
 * @param key - S3 object key (file name in bucket)
 * @param bucketName - S3 bucket name
 * @returns Upload result with URL
 */
const uploadToS3 = (filePath, key, bucketName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read file from local storage
        const fileContent = fs_1.default.readFileSync(filePath);
        // Get file extension and set content type
        const ext = path_1.default.extname(filePath).toLowerCase();
        const contentTypeMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        // Upload to S3
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
            // ACL removed - bucket has ACLs disabled, use bucket policy instead
        });
        yield s3Client.send(command);
        // Construct S3 URL
        const s3Url = `https://${bucketName}.s3.${config_1.default.aws.region}.amazonaws.com/${key}`;
        return {
            success: true,
            url: s3Url,
            key: key,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to upload to S3',
        };
    }
});
exports.uploadToS3 = uploadToS3;
/**
 * Delete file from S3 bucket
 * @param key - S3 object key
 * @param bucketName - S3 bucket name
 * @returns Deletion result
 */
const deleteFromS3 = (key, bucketName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        yield s3Client.send(command);
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to delete from S3',
        };
    }
});
exports.deleteFromS3 = deleteFromS3;
/**
 * Upload file to S3 and delete local file
 * @param localFilePath - Local file path
 * @param s3Key - S3 object key
 * @param bucketName - S3 bucket name
 * @returns Upload result
 */
const uploadAndCleanup = (localFilePath, s3Key, bucketName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Upload to S3
        const uploadResult = yield (0, exports.uploadToS3)(localFilePath, s3Key, bucketName);
        if (uploadResult.success) {
            // Delete local file after successful upload
            try {
                if (fs_1.default.existsSync(localFilePath)) {
                    fs_1.default.unlinkSync(localFilePath);
                }
            }
            catch (deleteError) {
                // Don't fail the upload if local deletion fails
            }
        }
        return uploadResult;
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to upload and cleanup',
        };
    }
});
exports.uploadAndCleanup = uploadAndCleanup;
/**
 * Extract S3 key from S3 URL
 * @param s3Url - Full S3 URL
 * @returns S3 key or null
 */
const extractS3Key = (s3Url) => {
    try {
        // Handle different S3 URL formats
        // Format 1: https://bucket-name.s3.region.amazonaws.com/key
        // Format 2: https://s3.region.amazonaws.com/bucket-name/key
        const url = new URL(s3Url);
        const pathname = url.pathname;
        // Remove leading slash and return the key
        return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    }
    catch (error) {
        return null;
    }
};
exports.extractS3Key = extractS3Key;
exports.default = {
    uploadToS3: exports.uploadToS3,
    deleteFromS3: exports.deleteFromS3,
    uploadAndCleanup: exports.uploadAndCleanup,
    extractS3Key: exports.extractS3Key,
};
