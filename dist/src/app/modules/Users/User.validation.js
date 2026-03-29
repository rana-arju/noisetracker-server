"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealerIdValidation = exports.UserUpdate = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UserUpdate = zod_1.default.object({
    body: zod_1.default.object({
        fullname: zod_1.default.string().optional(),
    }),
});
exports.DealerIdValidation = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({
            required_error: 'Dealer ID is required!',
        }),
    }),
});
