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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const hash = (pw) => bcrypt.hash(pw, 12);
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🌱 Starting seed...');
    // 0. Clear existing data
    yield prisma.reportVote.deleteMany();
    yield prisma.comment.deleteMany();
    yield prisma.report.deleteMany();
    yield prisma.user.deleteMany();
    console.log('🧹 Database cleared');
    // 1. Create superadmin
    let superadmin = yield prisma.user.create({
        data: {
            employeeId: '10001',
            name: 'Super Admin',
            email: 'superadmin@smtech.com',
            password: yield hash('superadmin123'),
            role: client_1.Role.SUPERADMIN,
            status: client_1.UserStatus.ACTIVE,
            isActive: true,
        },
    });
    console.log('✅ Superadmin created');
    // 2. Create admin
    let admin = yield prisma.user.create({
        data: {
            employeeId: '10002',
            name: 'Admin User',
            email: 'admin@smtech.com',
            password: yield hash('admin123'),
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            isActive: true,
        },
    });
    console.log('✅ Admin created');
    // 3. Create employees
    const employees = [
        { employeeId: '11612', name: 'Arif Hossain', email: 'arif@smtech.com', password: 'emp123' },
        { employeeId: '11623', name: 'Mitu Begum', email: 'mitu@smtech.com', password: 'emp123' },
        { employeeId: '11801', name: 'Karim Uddin', email: 'karim@smtech.com', password: 'emp123' },
        { employeeId: '11905', name: 'Sadia Islam', email: 'sadia@smtech.com', password: 'emp123' },
    ];
    const createdEmployees = [];
    for (const e of employees) {
        let user = yield prisma.user.findUnique({ where: { employeeId: e.employeeId } });
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    employeeId: e.employeeId,
                    name: e.name,
                    email: e.email,
                    password: yield hash(e.password),
                    role: client_1.Role.EMPLOYEE,
                    status: client_1.UserStatus.ACTIVE,
                    isActive: true,
                },
            });
            console.log(`✅ Employee created: ${e.employeeId} / ${e.password}`);
        }
        createdEmployees.push(user);
    }
    // 4. Create reports
    const reportData = [
        {
            reportedEmployeeName: 'Karim Uddin',
            reportedEmployeeId: '11801',
            description: 'Excessive noise during lunch break near Block C.',
            severity: client_1.Severity.HIGH,
            status: client_1.ReportStatus.APPROVED,
            createdById: createdEmployees[0].id,
        },
        {
            reportedEmployeeName: 'Sadia Islam',
            reportedEmployeeId: '11905',
            description: 'Playing loud music in shared workspace.',
            severity: client_1.Severity.MEDIUM,
            status: client_1.ReportStatus.APPROVED,
            createdById: createdEmployees[1].id,
        },
        {
            reportedEmployeeName: 'Arif Hossain',
            reportedEmployeeId: '11612',
            description: 'Disturbing colleagues with repeated phone calls.',
            severity: client_1.Severity.LOW,
            status: client_1.ReportStatus.PENDING,
            createdById: createdEmployees[2].id,
        },
    ];
    const createdReports = [];
    for (const r of reportData) {
        const existing = yield prisma.report.findFirst({
            where: {
                reportedEmployeeId: r.reportedEmployeeId,
                createdById: r.createdById,
            },
        });
        if (!existing) {
            const report = yield prisma.report.create({ data: r });
            createdReports.push(report);
            console.log(`✅ Report created for ${r.reportedEmployeeName}`);
        }
        else {
            createdReports.push(existing);
        }
    }
    // 5. Add comments on approved reports
    for (const report of createdReports.filter((r) => r.status === 'APPROVED')) {
        const commentCount = yield prisma.comment.count({ where: { reportId: report.id } });
        if (commentCount === 0) {
            yield prisma.comment.create({
                data: {
                    reportId: report.id,
                    userId: createdEmployees[3].id,
                    content: 'This has been going on for weeks!',
                },
            });
            yield prisma.comment.create({
                data: {
                    reportId: report.id,
                    userId: admin.id,
                    content: 'We are looking into this matter.',
                },
            });
            console.log(`✅ Comments added for report ${report.id}`);
        }
    }
    // 6. Add votes
    for (const report of createdReports.filter((r) => r.status === 'APPROVED')) {
        try {
            yield prisma.reportVote.create({
                data: { reportId: report.id, userId: createdEmployees[1].id, voteType: client_1.VoteType.UPVOTE },
            });
            yield prisma.reportVote.create({
                data: { reportId: report.id, userId: createdEmployees[3].id, voteType: client_1.VoteType.UPVOTE },
            });
            console.log(`✅ Votes added for report ${report.id}`);
        }
        catch (_a) {
            // Votes already exist
        }
    }
    console.log('\n🎉 Seed complete!');
    console.log('──────────────────────────────────────────');
    console.log('Superadmin → employeeId: 10001, password: superadmin123');
    console.log('Admin      → employeeId: 10002, password: admin123');
    console.log('Employee 1 → employeeId: 11612, password: emp123');
    console.log('Employee 2 → employeeId: 11623, password: emp123');
    console.log('Employee 3 → employeeId: 11801, password: emp123');
    console.log('Employee 4 → employeeId: 11905, password: emp123');
});
seed()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
