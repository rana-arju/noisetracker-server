"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.isValidObjectId = void 0;
/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns boolean - true if valid ObjectId format
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
exports.isValidObjectId = isValidObjectId;
/**
 * Validates ObjectId and throws error if invalid
 * @param id - The string to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if invalid
 */
const validateObjectId = (id, fieldName = 'ID') => {
    if (!(0, exports.isValidObjectId)(id)) {
        throw new Error(`Invalid ${fieldName} format. Must be a valid MongoDB ObjectId (24 hex characters).`);
    }
};
exports.validateObjectId = validateObjectId;
