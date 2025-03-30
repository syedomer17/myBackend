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
// import xss from "xss-clean"; // ✅ Prevents Cross-Site Scripting Attacks
import publicRouter from "./controllers/public/index";
import authMiddleWare from "./controllers/middleware/auth";
import privateRouter from "./controllers/private/user";
import "./utils/dbConnect";

const PORT: number = config.get<number>("PORT") || 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🧵 Primary process ${process.pid} is running`);

  // Fork workers (one per CPU core)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker on exit
  cluster.on("exit", (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Child worker process
  const app = express();

  // ✅ 1. Security Headers (OWASP Protection)
  app.use(helmet());

  // ✅ 2. Enable CORS with strict policies
  app.use(
    cors({
      origin: ["http://localhost:5173"], // Restrict to frontend only
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ 3. Protect against Cross-Site Scripting (XSS)
//   app.use(xss());

  // ✅ 4. Prevent NoSQL Injection Attacks
  app.use(mongoSanitize());

  // ✅ 5. Prevent HTTP Parameter Pollution
  app.use(hpp());

  // ✅ 6. Securely Parse Cookies
  app.use(cookieParser());

  // ✅ 7. Enable CSRF Protection
  app.use(
    csurf({
      cookie: true, // Uses cookies for CSRF protection
    })
  );

  // ✅ 8. Compress Responses (Performance Boost)
  app.use(compression());

  // ✅ 9. Enable Request Logging (Prevents log injection attacks)
  app.use(morgan("combined"));

  // ✅ 10. Prevent DDoS Attacks (Rate Limiting)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // ✅ 11. Define Routes
  app.use("/api/public", publicRouter);
  app.use(authMiddleWare);
  app.use("/auth/private", privateRouter);

  // ✅ 12. Base Route
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: `✅ Server is running on Worker ${process.pid}` });
  });

  // ✅ 13. Heavy Computation Route (Using Worker Threads)
  app.get("/heavy-task", (req: Request, res: Response) => {
    const worker = new Worker("./worker.ts"); // Create a new thread
    worker.on("message", (result) => {
      res.status(200).json({ message: "✅ Computation Complete", result });
    });

    worker.on("error", (error) => {
      res.status(500).json({ error: "❌ Worker Error", details: error.message });
    });
  });

  // ✅ 14. Handle 404 Errors
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "❌ Not Found Router" });
  });

  // ✅ 15. Error Handler Middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "❌ Internal Server Error" });
  });

  // ✅ 16. Start Server
  app.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} started on http://localhost:${PORT}`);
  });
}
