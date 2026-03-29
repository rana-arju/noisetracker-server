"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const _1 = __importDefault(require("."));
const serviceAccount_1 = require("./serviceAccount");
const envProjectId = _1.default.firebase.projectId ? _1.default.firebase.projectId.trim().replace(/,$/, '') : undefined;
const envClientEmail = _1.default.firebase.clientEmail ? _1.default.firebase.clientEmail.trim().replace(/,$/, '') : undefined;
const envPrivateKey = _1.default.firebase.privateKey ? _1.default.firebase.privateKey.replace(/\\n/g, '\n') : undefined;
const firebaseCredentials = envProjectId && envClientEmail && envPrivateKey
    ? {
        projectId: envProjectId,
        clientEmail: envClientEmail,
        privateKey: envPrivateKey,
    }
    : serviceAccount_1.serviceAccount;
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(firebaseCredentials),
    });
}
const firebaseAuth = firebase_admin_1.default.auth();
exports.firebaseAuth = firebaseAuth;
exports.default = firebase_admin_1.default;
