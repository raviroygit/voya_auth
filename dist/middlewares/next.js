"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.next = void 0;
const next = (reply, error) => {
    reply.status(error.statusCode).send({ success: false, message: error.message });
};
exports.next = next;
