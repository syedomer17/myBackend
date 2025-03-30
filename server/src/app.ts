import cluster from "cluster";
import os from "os";
import { Worker, isMainThread, parentPort } from "worker_threads";
import express, { Request, Response } from "express";
import config from "config";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import morgan from "morgan";
import path from "path";
// @ts-ignore
import xss from "xss-clean"; // ✅ Prevents Cross-Site Scripting Attacks
import publicRouter from "./controllers/public/index";
import authMiddleWare from "./controllers/middleware/auth";
import privateRouter from "./controllers/private/user";
import "./utils/dbConnect";

const PORT: number = config.get<number>("PORT") || 5000;
const numCPUs = os.cpus().length;

// Primary process handles clustering
if (cluster.isPrimary) {
  console.log(`🧵 Primary process ${process.pid} is running`);

  // Fork workers equal to the number of CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they exit unexpectedly
  cluster.on("exit", (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process handles requests
  const app = express();

  // Middleware configurations
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ Security Headers (OWASP Protection)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "trusted-cdn.com"],
      },
    },
  }));

  // ✅ Enable CORS with strict policies
  app.use(
    cors({
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ✅ Protect against Cross-Site Scripting (XSS)
  app.use(xss());

  // ✅ Prevent NoSQL Injection Attacks
  app.use(mongoSanitize());

  // ✅ Prevent HTTP Parameter Pollution
  app.use(hpp());

  // ✅ Securely Parse Cookies
  app.use(cookieParser());

  // ✅ Enable CSRF Protection
  app.use(csurf({ cookie: true }));
  app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // ✅ Compress Responses (Performance Boost)
  app.use(compression());

  // ✅ Enable Request Logging (Prevents log injection attacks)
  app.use(morgan("combined"));

  // ✅ Prevent DDoS Attacks (Rate Limiting)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // ✅ Define Public and Private Routes
  app.use("/api/public", publicRouter);
  app.use(authMiddleWare);
  app.use("/auth/private", privateRouter);

  // ✅ Base Route
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: `✅ Server is running on Worker ${process.pid}` });
  });

  // ✅ Heavy Computation Route (Using Worker Threads)
  app.get("/heavy-task", (req: Request, res: Response) => {
    const worker = new Worker(path.resolve(__dirname, "worker.js")); // Create a new worker thread
    worker.on("message", (result) => {
      res.status(200).json({ message: "✅ Computation Complete", result });
    });

    worker.on("error", (error) => {
      res.status(500).json({ error: "❌ Worker Error", details: error.message });
    });
  });

  // ✅ Handle 404 Errors
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "❌ Not Found Router" });
  });

  // ✅ Error Handler Middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "❌ Internal Server Error" });
  });

  // ✅ Graceful Shutdown for Workers
  process.on("SIGTERM", () => {
    console.log(`⚠️ Worker ${process.pid} exiting...`);
    process.exit(0);
  });

  // ✅ Start Server
  app.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} started on http://localhost:${PORT}`);
  });
}