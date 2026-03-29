"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler_1 = __importDefault(require("./app/errors/globalErrorHandler"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./app/routes"));
// Security middleware imports
const security_1 = require("./app/middlewares/security");
const security_2 = __importDefault(require("./config/security"));
const multerErrorHandler_1 = __importDefault(require("./app/middlewares/multerErrorHandler"));
const app = (0, express_1.default)();
// Trust proxy (for proper IP detection behind reverse proxy)
app.set('trust proxy', 1);
// Security headers (should be first)
app.use(security_1.securityHeaders);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Request logging for security events
app.use(security_1.securityLogger);
// Compression middleware
app.use(security_1.compressionMiddleware);
// Rate limiting
// app.use(generalRateLimit);
// app.use(speedLimiter);
// Request size limiting
app.use(security_1.requestSizeLimit);
// Static file serving with CORS for uploads (before other middleware)
app.use('/uploads', (0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://206.162.244.131:3002',
            'http://localhost:3002',
            'http://localhost:3031',
            'http://localhost:3000',
            'http://206.162.244.131:3031',
            // Add more frontend origins as needed
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(null, true); // Allow all origins for static files
        }
    },
    credentials: false,
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
}), express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    },
}));
// Serve static chart files with CORS
app.use('/charts', (0, cors_1.default)({
    origin: '*',
    credentials: false,
    methods: ['GET', 'HEAD', 'OPTIONS'],
}), express_1.default.static(path_1.default.join(__dirname, '../assets/charts'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
    },
}));
// CORS with enhanced security for API routes
app.use((0, cors_1.default)(security_2.default.cors));
// Parameter pollution protection
app.use(security_1.parameterPollutionProtection);
// MongoDB injection protection
app.use(security_1.mongoSanitization);
// Content-Type validation for POST/PUT requests
app.use((0, security_1.validateContentType)(['application/json', 'multipart/form-data']));
// API security headers
app.use(security_1.apiSecurityHeaders);
//parser with size limits
app.use(express_1.default.json({ limit: security_2.default.requestLimits.jsonLimit }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true, limit: security_2.default.requestLimits.urlEncodedLimit }));
// XSS protection (after parsing)
app.use(security_1.xssProtection);
app.get('/', (req, res) => {
    res.send({
        success: true,
        Message: 'luckyteeguarden Server is running...',
        data: {
            Developer: 'Rana Arju',
            version: 1.0,
        },
    });
});
app.use((0, morgan_1.default)('dev'));
app.use('/api/v1', routes_1.default);
// Handle multer errors specifically
app.use(multerErrorHandler_1.default);
app.use(globalErrorHandler_1.default);
app.use((req, res, next) => {
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message: 'API NOT FOUND!',
        error: {
            path: req.originalUrl,
            message: 'Your requested path is not found!',
        },
    });
});
exports.default = app;
