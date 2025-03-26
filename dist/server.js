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
const path_1 = __importDefault(require("path"));
const app_1 = require("./app");
const fs_1 = __importDefault(require("fs"));
const port = parseInt(process.env.PORT || "8001");
const isDev = process.env.NODE_ENV === "development"; // ✅ Check if running in development
let fastifyOptions = {};

// Start the server
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.app.listen({ port, host: "0.0.0.0" });
        console.log(`Server running on port: ${port}`);
    }
    catch (err) {
        app_1.app.log.error(err);
        process.exit(1);
    }
});
start();
