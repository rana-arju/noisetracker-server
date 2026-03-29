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
exports.createPaymentIntent = exports.createStripeCustomer = exports.WEBHOOK_SECRET = exports.STRIPE_WEBHOOK_EVENTS = exports.STRIPE_PLAN_TYPES = exports.STRIPE_PRICES = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const index_1 = __importDefault(require("./index"));
exports.stripe = new stripe_1.default(index_1.default.stripe_secret, {});
exports.STRIPE_PRICES = {
    BASIC_MONTHLY: "price_1RnzuoQmUMn16GEoFbXagwxO",
    PRO_MONTHLY: "price_1RnzteQmUMn16GEokVGaDvOR",
};
// Plan type constants for Stripe metadata
exports.STRIPE_PLAN_TYPES = {
    MONTHLY: 'MONTHLY',
    LIMITED_TIME_AUDIT: 'LIMITED_TIME_AUDIT',
    LIFETIME: 'LIFETIME',
    AUDIT_PRICE: 'AUDIT_PRICE' // For individual audit pricing
};
// Stripe webhook events we handle
exports.STRIPE_WEBHOOK_EVENTS = {
    PAYMENT_SUCCESS: 'payment_intent.succeeded',
    SUBSCRIPTION_CREATED: 'customer.subscription.created',
    SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
    INVOICE_PAYMENT_SUCCESS: 'invoice.payment_succeeded',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};
exports.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET_KEY;
// Utility function to create Stripe customer
const createStripeCustomer = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.stripe.customers.create({
        email,
        name,
    });
});
exports.createStripeCustomer = createStripeCustomer;
// Utility function to create payment intent for one-time purchases
const createPaymentIntent = (amount_1, ...args_1) => __awaiter(void 0, [amount_1, ...args_1], void 0, function* (amount, currency = 'USD', customerId) {
    return yield exports.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: {
            enabled: true,
        },
    });
});
exports.createPaymentIntent = createPaymentIntent;
