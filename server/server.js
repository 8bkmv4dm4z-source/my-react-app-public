// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// --- 🔹 Log file setup ---
const logDir = path.join(__dirname, "logs");
const logFile = path.join(logDir, "server.log");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Redirect console output to both console + file
const logStream = fs.createWriteStream(logFile, { flags: "a" });
const log = (type, msg) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${type}] ${msg}\n`;
  process.stdout.write(line);
  logStream.write(line);
};

// Override console methods
["log", "info", "warn", "error"].forEach((method) => {
  const original = console[method];
  console[method] = (...args) => {
    const message = args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : a)).join(" ");
    log(method.toUpperCase(), message);
    original.apply(console, args); // still print to terminal
  };
});

// --- 🔹 Health route ---
app.get("/", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- 🔹 Routers ---
app.use("/api/users", require("./routes/users"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/workshops", require("./routes/workshops"));
app.use("/api/profile", require("./routes/profile"));

// --- 🔹 MongoDB connection + server start ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is not set in server/.env");
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected:", mongoose.connection.host);

    process.on("unhandledRejection", (r) => console.error("UNHANDLED REJECTION:", r));
    process.on("uncaughtException", (e) => console.error("UNCAUGHT EXCEPTION:", e));

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Mongo connect error:", err.message);
    process.exit(1);
  }
})();
