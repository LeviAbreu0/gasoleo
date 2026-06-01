/**
 * Gasóleo REST API — Express + MySQL (mysql2/promise pool).
 *
 * Routes:
 *   GET/POST    /api/fuel
 *   GET/PUT/DELETE /api/fuel/:id
 *   GET/POST    /api/oil
 *   GET/PUT/DELETE /api/oil/:id
 *
 * JSON bodies use ISO dates (YYYY-MM-DD) and decimal numbers as numbers or strings.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const PORT = Number(process.env.PORT) || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gasoleo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin || true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

function rowToFuel(row) {
  return {
    id: String(row.id),
    date: formatDateOnly(row.entry_date),
    liters: String(row.liters),
    km: String(row.km),
    price: String(row.price),
  };
}

function rowToOil(row) {
  return {
    id: String(row.id),
    date: formatDateOnly(row.entry_date),
    km: String(row.km),
    type: row.oil_type,
    price: row.price != null ? String(row.price) : "",
    kmTroca: row.km_troca != null ? String(row.km_troca) : undefined,
  };
}

function formatDateOnly(d) {
  if (!d) return "";
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function parseNum(v, field) {
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing or invalid ${field}`);
  }
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${field}`);
  return n;
}

function parseOptionalNum(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseDateIso(v) {
  if (!v || typeof v !== "string") throw new Error("date must be YYYY-MM-DD");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error("date must be YYYY-MM-DD");
  return v;
}

// --- Fuel ---
app.get("/api/fuel", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, entry_date, liters, km, price FROM fuel_entries ORDER BY entry_date DESC, id DESC"
    );
    res.json(rows.map(rowToFuel));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/fuel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      "SELECT id, entry_date, liters, km, price FROM fuel_entries WHERE id = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rowToFuel(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/fuel", async (req, res) => {
  try {
    const body = req.body || {};
    const entry_date = parseDateIso(body.date);
    const liters = parseNum(body.liters, "liters");
    const km = parseNum(body.km, "km");
    const price = parseNum(body.price, "price");
    const [r] = await pool.query(
      "INSERT INTO fuel_entries (entry_date, liters, km, price) VALUES (?,?,?,?)",
      [entry_date, liters, km, price]
    );
    const [rows] = await pool.query(
      "SELECT id, entry_date, liters, km, price FROM fuel_entries WHERE id = ?",
      [r.insertId]
    );
    res.status(201).json(rowToFuel(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.put("/api/fuel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const entry_date = parseDateIso(body.date);
    const liters = parseNum(body.liters, "liters");
    const km = parseNum(body.km, "km");
    const price = parseNum(body.price, "price");
    const [u] = await pool.query(
      "UPDATE fuel_entries SET entry_date=?, liters=?, km=?, price=? WHERE id=?",
      [entry_date, liters, km, price, id]
    );
    if (u.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query(
      "SELECT id, entry_date, liters, km, price FROM fuel_entries WHERE id = ?",
      [id]
    );
    res.json(rowToFuel(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.delete("/api/fuel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [d] = await pool.query("DELETE FROM fuel_entries WHERE id = ?", [id]);
    if (d.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// --- Oil ---
app.get("/api/oil", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, entry_date, km, oil_type, price, km_troca FROM oil_entries ORDER BY entry_date DESC, id DESC"
    );
    res.json(rows.map(rowToOil));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/api/oil/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      "SELECT id, entry_date, km, oil_type, price, km_troca FROM oil_entries WHERE id = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rowToOil(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/oil", async (req, res) => {
  try {
    const body = req.body || {};
    const entry_date = parseDateIso(body.date);
    const km = parseNum(body.km, "km");
    const oil_type = String(body.type || "").trim();
    if (!oil_type) throw new Error("type is required");
    const priceVal = parseOptionalNum(body.price);
    const kmTrocaVal = parseOptionalNum(body.kmTroca);
    const [r] = await pool.query(
      "INSERT INTO oil_entries (entry_date, km, oil_type, price, km_troca) VALUES (?,?,?,?,?)",
      [entry_date, km, oil_type, priceVal, kmTrocaVal]
    );
    const [rows] = await pool.query(
      "SELECT id, entry_date, km, oil_type, price, km_troca FROM oil_entries WHERE id = ?",
      [r.insertId]
    );
    res.status(201).json(rowToOil(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.put("/api/oil/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const entry_date = parseDateIso(body.date);
    const km = parseNum(body.km, "km");
    const oil_type = String(body.type || "").trim();
    if (!oil_type) throw new Error("type is required");
    const priceVal = parseOptionalNum(body.price);
    const kmTrocaVal = parseOptionalNum(body.kmTroca);
    const [u] = await pool.query(
      "UPDATE oil_entries SET entry_date=?, km=?, oil_type=?, price=?, km_troca=? WHERE id=?",
      [entry_date, km, oil_type, priceVal, kmTrocaVal, id]
    );
    if (u.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query(
      "SELECT id, entry_date, km, oil_type, price, km_troca FROM oil_entries WHERE id = ?",
      [id]
    );
    res.json(rowToOil(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: String(e.message || e) });
  }
});

app.delete("/api/oil/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [d] = await pool.query("DELETE FROM oil_entries WHERE id = ?", [id]);
    if (d.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Gasóleo API listening on http://localhost:${PORT}`);
});
