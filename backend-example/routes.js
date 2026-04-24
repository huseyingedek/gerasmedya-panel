/**
 * Express router — bu dosyayı kendi index.js'ine dahil et
 * 
 * Kullanım:
 *   const routes = require("./backend-example/routes");
 *   app.use("/api", routes);
 */

const express = require("express");
const router = express.Router();
const { createPayment, getMe, login } = require("./payment");

// CORS — Next.js'ten gelen istekler için
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

router.post("/payment/create", createPayment);
router.get("/auth/me", getMe);
router.post("/auth/login", login);

module.exports = router;
