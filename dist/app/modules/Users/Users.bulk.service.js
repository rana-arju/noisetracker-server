"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.UsersBulkService = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const XLSX = __importStar(require("xlsx"));
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getBulkUploadPreview = (filePath, fileType) => __awaiter(void 0, void 0, void 0, function* () {
    let rows = [];
    if (fileType === 'csv') {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        rows = (0, sync_1.parse)(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
    }
    else {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet);
    }
    const previewData = [];
    let summary = {
        total: rows.length,
        new: 0,
        existing: 0,
        invalid: 0,
    };
    for (const row of rows) {
        const { employeeId, name, password, email, phone, designation } = row;
        // Validation: employeeId and name required
        if (!employeeId || !name) {
            summary.invalid++;
            previewData.push(Object.assign(Object.assign({}, row), { status: 'INVALID', message: 'Missing employeeId or name' }));
            continue;
        }
        const strEmployeeId = String(employeeId).trim();
        // Check for existing employee
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { employeeId: strEmployeeId },
        });
        if (existingUser) {
            summary.existing++;
            previewData.push(Object.assign(Object.assign({}, row), { status: 'EXISTING', message: 'Employee ID already exists' }));
        }
        else {
            summary.new++;
            previewData.push(Object.assign(Object.assign({}, row), { status: 'NEW' }));
        }
    }
    // Cleanup file after preview (optional, but good for security)
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    return {
        summary,
        previewData,
    };
});
const confirmBulkUpload = (users) => __awaiter(void 0, void 0, void 0, function* () {
    const result = {
        inserted: 0,
        failed: 0,
        details: [],
    };
    for (const user of users) {
        const { employeeId, name, password, email, phone, designation } = user;
        try {
            // Final existence check before insertion
            const existingUser = yield prisma_1.default.user.findUnique({
                where: { employeeId: String(employeeId).trim() },
            });
            if (existingUser) {
                result.failed++;
                result.details.push({ employeeId, status: 'FAILED', message: 'Already exists' });
                continue;
            }
            // Use provided password or default to employeeId if missing
            const passToHash = password ? String(password) : String(employeeId);
            const hashedPassword = yield bcrypt.hash(passToHash, Number(config_1.default.bcrypt_salt_rounds));
            yield prisma_1.default.user.create({
                data: {
                    employeeId: String(employeeId).trim(),
                    password: hashedPassword,
                    name: name ? String(name).trim() : null,
                    email: email ? String(email).trim() : null,
                    phone: phone ? String(phone).trim() : null,
                    designation: designation ? String(designation).trim() : null,
                    role: client_1.Role.EMPLOYEE,
                    status: client_1.UserStatus.ACTIVE,
                    isActive: true,
                },
            });
            result.inserted++;
            result.details.push({ employeeId, status: 'INSERTED' });
        }
        catch (error) {
            result.failed++;
            result.details.push({ employeeId, status: 'FAILED', message: error.message });
        }
    }
    return result;
});
exports.UsersBulkService = {
    getBulkUploadPreview,
    confirmBulkUpload,
};
