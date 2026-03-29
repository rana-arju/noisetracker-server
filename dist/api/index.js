"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
const seedSuperAdmin_1 = __importDefault(require("../src/app/seedSuperAdmin"));
// This is the Vercel entry point
// We call seedSuperAdmin() to match the behavior in server.ts
(0, seedSuperAdmin_1.default)().catch(err => console.error('Seeding error:', err));
exports.default = app_1.default;
