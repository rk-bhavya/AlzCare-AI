import dotenv from "dotenv";

// Load variables from the .env file into process.env
dotenv.config();

/**
 * Validates that all mandatory environment variables exist.
 * Failing fast at startup is far better than crashing later
 * with a confusing "undefined" error at runtime.
 */
const requiredVariables = ["PORT", "MONGO_URI"];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable]
);

if (missingVariables.length > 0) {
  console.error(
    `\n❌ Missing required environment variables: ${missingVariables.join(", ")}`
  );
  console.error("👉 Create a .env file in /backend using .env.example\n");
  process.exit(1);
}

const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
};

export default env;
