import { Router } from "express";
const r = Router();
r.get("/test", (req, res) => res.json({ message: "OTP ROUTE WORKS" }));
r.post("/generate", (req, res) => res.json({ ok: true, code: "BAZARI-123" }));
r.get("/webhook", (req, res) => res.send("WEBHOOK_OK"));
export default r;
