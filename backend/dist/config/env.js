"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
exports.env = {
    PORT: parseInt(process.env.PORT || "4000"),
    MONGO_URI: requiredEnv("MONGO_URI"),
    REDIS_HOST: requiredEnv("REDIS_HOST"),
    REDIS_PORT: parseInt(requiredEnv("REDIS_PORT")),
    CLOUDINARY_CLOUD_NAME: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: requiredEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: requiredEnv("CLOUDINARY_API_SECRET"),
    JWT_SECRET: requiredEnv("JWT_SECRET"),
};
//# sourceMappingURL=env.js.map