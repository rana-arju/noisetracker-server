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
const bulkUploadEmployees = (filePath, fileType) => __awaiter(void 0, void 0, void 0, function* () {
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
    let totalRows = rows.length;
    let insertedRows = 0;
    let skippedRows = 0;
    let invalidRows = 0;
    const details = [];
    for (const row of rows) {
        const { employeeId, password, name, email, phone } = row;
        // Basic validation
        if (!employeeId || !password) {
            invalidRows++;
            details.push({ employeeId: employeeId || 'N/A', status: 'INVALID', message: 'Missing employeeId or password' });
            continue;
        }
        const strEmployeeId = String(employeeId).trim();
        // Check for existing employee
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { employeeId: strEmployeeId },
        });
        if (existingUser) {
            skippedRows++;
            details.push({ employeeId: strEmployeeId, status: 'SKIPPED', message: 'Duplicate employeeId' });
            continue;
        }
        try {
            const hashedPassword = yield bcrypt.hash(String(password), Number(config_1.default.bcrypt_salt_rounds));
            yield prisma_1.default.user.create({
                data: {
                    employeeId: strEmployeeId,
                    password: hashedPassword,
                    name: name ? String(name).trim() : null,
                    email: email ? String(email).trim() : null,
                    phone: phone ? String(phone).trim() : null,
                    role: client_1.Role.EMPLOYEE,
                    status: client_1.UserStatus.ACTIVE,
                    isActive: true,
                },
            });
            insertedRows++;
            details.push({ employeeId: strEmployeeId, status: 'INSERTED' });
        }
        catch (error) {
            invalidRows++;
            details.push({ employeeId: strEmployeeId, status: 'FAILED', message: error.message });
        }
    }
    // Cleanup file
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    return {
        summary: {
            totalRows,
            insertedRows,
            skippedRows,
            invalidRows,
        },
        details,
    };
});
exports.UsersBulkService = {
    bulkUploadEmployees,
};
