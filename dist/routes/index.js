"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const auth_routes_1 = require("./auth.routes");
function registerRoutes(app) {
    app.register(auth_routes_1.authRoutes, { prefix: "/api/v1/auth" });
}
