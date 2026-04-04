import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";

const app: Express = express();

/**
 * Bug 4 Fix: CORS configuration explicitly whitelisting GitHub Pages origin
 * with credentials support and mandatory methods.
 */
app.use(
  cors({
    origin: "https://buddhimasanthush.github.io",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Note: cors() middleware already handles preflight (OPTIONS) requests globally.

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/healthpre", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
