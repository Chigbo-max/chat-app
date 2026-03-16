"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApolloServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
const startApolloServer = async () => {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => {
            const token = req.headers.authorization || "";
            return {
                token
            };
        }
    });
    await server.start();
    server.applyMiddleware({
        app,
        path: "/graphql"
    });
    return app;
};
exports.startApolloServer = startApolloServer;
exports.default = app;
//# sourceMappingURL=app.js.map