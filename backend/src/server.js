import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import otpRoutes from "./routes/otp.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import cartRoutes from "./routes/cart.js";
import reviewRoutes from "./routes/reviews.js";
import searchRoutes from "./routes/search.js";
import notificationRoutes from "./routes/notifications.js";
import pushRoutes from "./routes/push.js";
import adminRoutes from "./routes/admin.js";
import paymentMethodsRoutes from "./routes/paymentMethods.js";
import homepageRoutes from "./routes/homepage.js";
import { ensureBootstrapAdmin } from "./bootstrap.js";
import settingsRoutes from "./routes/settings.js";
import { startKeepAlive } from "./keepAlive.js";

const app = express();
const PORT = process.env.PORT || 10000;

const origins = (process.env.CORS_ORIGINS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin (curl, mobile) and any whitelisted origin
    if (!origin) return cb(null, true);
    if (origins.length === 0 || origins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ ok: true, service: "modamall-backend" }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/payment-methods", paymentMethodsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

connectDB().then(async () => {
  await ensureBootstrapAdmin();
  startKeepAlive();
  app.listen(PORT, () => console.log(`🚀 Bazari Backend active on :${PORT}`));
}).catch((err) => {
  console.error("DB connect failed:", err);
  process.exit(1);
});
