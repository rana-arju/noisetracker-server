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
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
class SteadfastClient {
    constructor() {
        this.config = {
            apiKey: config_1.default.steadfast.apiKey || '',
            secretKey: config_1.default.steadfast.secretKey || '',
            baseUrl: config_1.default.steadfast.baseUrl || 'https://portal.packzy.com/api/v1',
        };
        // Enable mock mode if STEADFAST_MOCK_MODE is true
        // Works in any environment (development, production, etc.)
        this.mockMode = process.env.STEADFAST_MOCK_MODE === 'true';
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            headers: {
                'Api-Key': this.config.apiKey,
                'Secret-Key': this.config.secretKey,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        if (this.mockMode) {
            console.log('⚠️  STEADFAST MOCK MODE ENABLED - Using fake responses');
            console.log('   To use real API, set STEADFAST_MOCK_MODE=false in .env');
        }
        else {
            console.log('✅ STEADFAST LIVE MODE - Using real API');
        }
    }
    handleError(error) {
        var _a, _b;
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            const errorData = ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) || {};
            throw {
                message: axiosError.message,
                status: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.status,
                data: errorData,
            };
        }
        throw error;
    }
    createOrder(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock response for development
            if (this.mockMode) {
                console.log('📦 MOCK: Creating order', payload.invoice);
                return {
                    status: 200,
                    message: 'Order created successfully (MOCK)',
                    consignment: {
                        consignment_id: Math.floor(Math.random() * 1000000),
                        invoice: payload.invoice,
                        tracking_code: `MOCK-${Date.now()}`,
                        recipient_name: payload.recipient_name,
                        recipient_phone: payload.recipient_phone,
                        recipient_address: payload.recipient_address,
                        cod_amount: payload.cod_amount,
                        status: 'in_review',
                        note: payload.note,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                };
            }
            try {
                const response = yield this.client.post('/create_order', payload);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    bulkCreateOrders(orders) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post('/create_order/bulk-order', { data: JSON.stringify(orders) });
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getStatusByConsignmentId(consignmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/status_by_cid/${consignmentId}`);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getStatusByInvoice(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/status_by_invoice/${invoice}`);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getStatusByTrackingCode(trackingCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/status_by_trackingcode/${trackingCode}`);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get('/get_balance');
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    createReturnRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post('/create_return_request', payload);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getReturnRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/get_return_request/${id}`);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getReturnRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get('/get_return_requests');
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get('/payments');
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getPaymentById(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(`/payments/${paymentId}`);
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
    getPoliceStations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get('/police_stations');
                return response.data;
            }
            catch (error) {
                this.handleError(error);
            }
        });
    }
}
exports.default = new SteadfastClient();
