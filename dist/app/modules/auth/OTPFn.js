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
exports.OTPFn = void 0;
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const sentEmailUtility_1 = __importDefault(require("../../utils/sentEmailUtility"));
const OTPFn = (email, userId, emailSubject, emailTemplate) => __awaiter(void 0, void 0, void 0, function* () {
    const OTP_EXPIRY_TIME = Number(config_1.default.otp_expiry_time) * 60 * 1000;
    const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const emailHTML = emailTemplate(otpCode);
    yield (0, sentEmailUtility_1.default)(email, emailSubject, emailHTML);
    const existingOtp = yield prisma_1.default.oTP.findFirst({
        where: { userId },
    });
    if (existingOtp) {
        yield prisma_1.default.oTP.update({
            where: {
                id: existingOtp.id,
            },
            data: {
                otpCode: otpCode.toString(),
                userId,
                expiry,
            },
        });
    }
    else {
        yield prisma_1.default.oTP.create({
            data: {
                otpCode: otpCode.toString(),
                userId,
                expiry,
            },
        });
    }
    return;
});
exports.OTPFn = OTPFn;
