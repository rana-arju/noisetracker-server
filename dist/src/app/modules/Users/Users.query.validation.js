"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQueryValidation = void 0;
const zod_1 = require("zod");
exports.getUsersQueryValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().transform((val) => parseInt(val, 10)).optional(),
        limit: zod_1.z.string().transform((val) => parseInt(val, 10)).optional(),
        search: zod_1.z.string().optional(),
        role: zod_1.z.enum(['USER', 'all']).optional(),
        status: zod_1.z.enum(['ACTIVE', 'PENDING', 'BLOCKED', 'INACTIVE', 'all']).optional(),
        sortBy: zod_1.z.enum(['name', 'email', 'role', 'status', 'created', 'updated']).optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
        isVerified: zod_1.z.string().transform((val) => val === 'true').optional(),
        hasSubscription: zod_1.z.string().transform((val) => val === 'true').optional(),
    }).optional(),
});
