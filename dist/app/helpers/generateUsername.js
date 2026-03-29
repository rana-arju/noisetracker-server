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
exports.generateUniqueUsername = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Generate a unique username based on fullname
 * @param fullname - User's full name
 * @returns A unique username
 */
const generateUniqueUsername = (fullname) => __awaiter(void 0, void 0, void 0, function* () {
    // Clean and format the fullname
    const baseUsername = fullname
        .toLowerCase()
        .replace(/\s+/g, '') // Remove spaces
        .replace(/[^a-z0-9]/g, ''); // Remove special characters
    // Check if base username is available
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { username: baseUsername },
    });
    if (!existingUser) {
        return baseUsername;
    }
    // If not available, append numbers until we find a unique one
    let counter = 1;
    let uniqueUsername = `${baseUsername}${counter}`;
    while (true) {
        const userExists = yield prisma_1.default.user.findUnique({
            where: { username: uniqueUsername },
        });
        if (!userExists) {
            return uniqueUsername;
        }
        counter++;
        uniqueUsername = `${baseUsername}${counter}`;
    }
});
exports.generateUniqueUsername = generateUniqueUsername;
