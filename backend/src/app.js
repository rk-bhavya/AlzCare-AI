import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import env from "./config/env.js";
import apiRoutes from "./routes/index.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

const app = express();

/* ------------------------------------------------------------------
   1. SECURITY HEADERS
------------------------------------------------------------------ */
app.use(helmet({ crossOriginResourcePolicy: false }));

/* ------------------------------------------------------------------
   2. CORS — allow the React dev server to call this API
------------------------------------------------------------------ */
const allowedOrigins = [env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools without an origin header (Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true, // required later for httpOnly cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/* ------------------------------------------------------------------
   3. BODY & COOKIE PARSERS
------------------------------------------------------------------ */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

/* ------------------------------------------------------------------
   4. RESPONSE COMPRESSION
------------------------------------------------------------------ */
app.use(compression());

/* ------------------------------------------------------------------
   5. HTTP REQUEST LOGGING (development only)
------------------------------------------------------------------ */
if (env.isDevelopment) {
  app.use(morgan("dev"));
}

/* ------------------------------------------------------------------
   6. RATE LIMITING — basic abuse / brute-force protection
------------------------------------------------------------------ */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

app.use("/api", globalLimiter);

/* ------------------------------------------------------------------
   7. ROOT ROUTE — quick sanity check in the browser
------------------------------------------------------------------ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI-Based Early Alzheimer's Detection API",
    version: "v1",
    documentation: "/api/v1/health",
  });
});

/* ------------------------------------------------------------------
   8. API ROUTES (versioned)
------------------------------------------------------------------ */
app.use("/api/v1", apiRoutes);

/* ------------------------------------------------------------------
   9. 404 HANDLER + GLOBAL ERROR HANDLER (order matters!)
------------------------------------------------------------------ */
app.use(notFound);
app.use(errorHandler);

export default app;
