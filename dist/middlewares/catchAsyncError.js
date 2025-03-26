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
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsyncError = void 0;
/**
 * Higher-Order Function to catch async errors in Fastify routes.
 * @param fn - The route handler function
 * @returns A function that automatically catches errors and forwards them to Fastify error handling
 */
const catchAsyncError = (fn) => (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fn(req, reply);
    }
    catch (error) {
        reply.send(error);
    }
});
exports.catchAsyncError = catchAsyncError;
