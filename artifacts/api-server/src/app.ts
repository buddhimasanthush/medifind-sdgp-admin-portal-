import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";

const app: Express = express();
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS?.split(",") ?? [
    "https://buddhimasanthush.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ])
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin "${origin}" is not allowed by CORS.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const handleHealthRequest: RequestHandler = (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};

app.get("/health", handleHealthRequest);
app.use("/api", router);
app.get("/healthpre", handleHealthRequest);

export default app;
