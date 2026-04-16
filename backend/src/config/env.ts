import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
}

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || "4000"),

  MONGO_URI: requiredEnv("MONGO_URI"),

  JWT_SECRET: requiredEnv("JWT_SECRET"),
};