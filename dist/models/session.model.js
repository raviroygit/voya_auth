"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isInvalidated: { type: Boolean, default: false },
    loggedOutAt: { type: Date, default: null },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
}, { timestamps: true });
// Auto-expire expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.Session = (0, mongoose_1.model)("Session", sessionSchema);
