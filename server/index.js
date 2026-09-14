/* global process, Buffer */
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Razorpay from "razorpay";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "data.json");
const app = express();
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "local-development-secret-change-me";
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));

const readData = () => JSON.parse(fs.readFileSync(dataPath, "utf8"));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
const createToken = (user) => jwt.sign({ id: user.id, email: user.email, name: user.name }, jwtSecret, { expiresIn: "7d" });

const auth = (request, response, next) => {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return response.status(401).json({ message: "Authentication required." });

  try {
    request.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return response.status(401).json({ message: "Session expired. Please log in again." });
  }
};

const getStatus = (createdAt, cancelled) => {
  if (cancelled) return "Cancelled";
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
  if (elapsed >= 90) return "Delivered";
  if (elapsed >= 45) return "Out for delivery";
  if (elapsed >= 15) return "Preparing";
  return "Order placed";
};

app.get("/api/health", (request, response) => response.json({ ok: true }));

app.post("/api/auth/register", async (request, response) => {
  const { name, email, password } = request.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return response.status(400).json({ message: "Name, email and an 8-character password are required." });
  }

  const data = readData();
  const normalizedEmail = email.trim().toLowerCase();
  if (data.users.some((user) => user.email === normalizedEmail)) {
    return response.status(409).json({ message: "An account with this email already exists." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  writeData(data);
  return response.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token: createToken(user) });
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body;
  const data = readData();
  const user = data.users.find((candidate) => candidate.email === email?.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return response.status(401).json({ message: "Invalid email or password." });
  }
  return response.json({ user: { id: user.id, name: user.name, email: user.email }, token: createToken(user) });
});

app.get("/api/auth/me", auth, (request, response) => response.json({ user: request.user }));

app.get("/api/orders", auth, (request, response) => {
  const data = readData();
  const orders = data.orders
    .filter((order) => order.userId === request.user.id)
    .map((order) => ({ ...order, status: getStatus(order.createdAt, order.cancelled) }))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  return response.json({ orders });
});

app.post("/api/orders", auth, (request, response) => {
  const { items, total, address, paymentId } = request.body;
  if (!Array.isArray(items) || items.length === 0 || !Number.isFinite(total) || !address?.trim()) {
    return response.status(400).json({ message: "Items, total and delivery address are required." });
  }
  const data = readData();
  const order = {
    id: `CU${Date.now()}`,
    userId: request.user.id,
    items,
    total,
    address: address.trim(),
    paymentId: paymentId || null,
    paymentStatus: paymentId ? "paid" : "pending",
    createdAt: new Date().toISOString(),
    cancelled: false,
    eta: 35,
  };
  data.orders.push(order);
  writeData(data);
  return response.status(201).json({ order: { ...order, status: "Order placed" } });
});

app.post("/api/orders/:id/cancel", auth, (request, response) => {
  const data = readData();
  const order = data.orders.find((candidate) => candidate.id === request.params.id && candidate.userId === request.user.id);
  if (!order) return response.status(404).json({ message: "Order not found." });
  if ((Date.now() - new Date(order.createdAt).getTime()) / 1000 >= 45) {
    return response.status(409).json({ message: "This order can no longer be cancelled." });
  }
  order.cancelled = true;
  writeData(data);
  return response.json({ order: { ...order, status: "Cancelled" } });
});

const razorpayMode = process.env.RAZORPAY_MODE || "test";
const requiredKeyPrefix = razorpayMode === "live" ? "rzp_live_" : "rzp_test_";
const hasRazorpayConfig = process.env.RAZORPAY_KEY_ID?.startsWith(requiredKeyPrefix) &&
  process.env.RAZORPAY_KEY_SECRET &&
  !process.env.RAZORPAY_KEY_ID.includes("your_") &&
  !process.env.RAZORPAY_KEY_SECRET.includes("your_");
const razorpay = hasRazorpayConfig
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

app.post("/api/payments/create-order", auth, async (request, response) => {
  if (!razorpay) return response.status(503).json({ message: `Razorpay ${razorpayMode} mode is not configured. Add matching keys to server/.env.` });
  const amount = Number(request.body.amount);
  if (!Number.isInteger(amount) || amount < 1) return response.status(400).json({ message: "A valid amount is required." });
  try {
    const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` });
    return response.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch {
    return response.status(502).json({ message: "Unable to create the payment order." });
  }
});

app.post("/api/payments/verify", auth, (request, response) => {
  const { orderId, paymentId, signature } = request.body;
  if (!orderId || !paymentId || !signature) return response.status(400).json({ message: "Payment verification details are required." });
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) return response.status(400).json({ message: "Payment verification failed." });
  return response.json({ verified: true, paymentId });
});

app.listen(port, () => console.log(`CraveUp API running on http://localhost:${port}`));
