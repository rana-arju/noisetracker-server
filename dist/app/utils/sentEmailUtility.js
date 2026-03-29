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
const config_1 = __importDefault(require("../../config"));
const nodemailer = require('nodemailer');
const smtpTransporter = require('nodemailer-smtp-transport');
let sentEmailUtility = (emailTo, EmailSubject, EmailHTML, // HTML content as a parameter
EmailText) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config_1.default.emailSender.email,
            pass: config_1.default.emailSender.app_pass,
        },
    });
    let mailOption = {
        from: config_1.default.emailSender.email,
        to: emailTo,
        subject: EmailSubject,
        text: EmailText,
        html: EmailHTML,
    };
    return yield transporter.sendMail(mailOption);
});
exports.default = sentEmailUtility;
