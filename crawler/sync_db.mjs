import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("..", import.meta.url));
const dataDir = join(root, "data");

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function readJson(p, fallback) {
  try {
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
  } catch {}
  return fallback;
}

const livePrices = readJson(join(dataDir, "live", "prices.json"), []);
const manualPath = join(dataDir, "manual", "import.csv");
const records = [...livePrices];
if (existsSync(manualPath)) {
  const lines = readFileSync(manualPath, "utf8").split(/\r?\n/).filter((l) => l.trim());
  lines.forEach((line, i) => {
    const c = line.split(",").map((s) => s.trim());
    if (i === 0 && !/^\d+$/.test(c[3] || "")) return;
    const price = parseInt(c[3], 10);
    if (!isFinite(price) || price <= 0) return;
    records.push({ id: `manual-${c[0]}-${c[3]}-${i}`, species: c[0], locality: c[1], sizeCm: parseFloat(c[2]) || 0, priceCNY: price, status: c[4] === "成交" || c[4] === "deal" ? "deal" : c[4] === "报价" || c[4] === "quote" ? "quote" : "list", channel: c[5] || "手动录入", note: c[6] || "", date: c[7] || new Date().toISOString().slice(0, 10), url: c[8] || "" });
  });
}

const today = new Date().toISOString().slice(0, 16);
const perSpecies = {};
for (const sp of [...new Set(records.map((r) => r.species))]) {
  const rs = records.filter((r) => r.species === sp);
  const deals = rs.filter((r) => r.status === "deal").map((r) => r.priceCNY);
  const lists = rs.filter((r) => r.status === "list").map((r) => r.priceCNY);
  const m = deals.length ? median(deals) : lists.length ? median(lists) : 0;
  if (m) perSpecies[sp] = m;
}
const snapLine = { date: today, perSpecies, sample: records.length };

const histDir = join(dataDir, "history");
if (!existsSync(histDir)) mkdirSync(histDir, { recursive: true });
const snapPath = join(histDir, "snapshots.jsonl");
const snaps = existsSync(snapPath)
  ? readFileSync(snapPath, "utf8").split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)).filter((s) => s && s.date && s.perSpecies)
  : [];
const idxOld = snaps.findIndex((s) => s.date === today);
if (idxOld >= 0) snaps[idxOld] = snapLine;
else snaps.push(snapLine);
snaps.sort((a, b) => a.date.localeCompare(b.date));
writeFileSync(snapPath, snaps.map((s) => JSON.stringify(s)).join("\n") + "\n");

const dates = snaps.map((s) => s.date);
const values = snaps.map((s) => {
  const vals = Object.values(s.perSpecies).filter(Boolean);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + Math.log10(b), 0) / vals.length / 3.3) * 1000);
});
let last = 1000;
const seriesValues = values.map((v) => (v === null ? last : (last = v)));
const series = { dates, values: seriesValues, perSpecies: [] };
writeFileSync(join(histDir, "series.json"), JSON.stringify(series, null, 2));
console.log(`历史序列: ${dates.length} 个采样日, 最新指数 ${seriesValues[seriesValues.length - 1]}, 今日样本 ${records.length} 条`);

let db = null;
try {
  const Database = require("better-sqlite3");
  db = new Database(join(dataDir, "mineral.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`CREATE TABLE IF NOT EXISTS prices (id TEXT, species TEXT, locality TEXT, sizeCm REAL, priceCNY INTEGER, status TEXT, channel TEXT, note TEXT, date TEXT, url TEXT, source TEXT, fetched_at TEXT, PRIMARY KEY (id, date))`);
  const stmt = db.prepare(`INSERT OR REPLACE INTO prices VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const now = new Date().toISOString();
  let n = 0;
  for (const r of records) {
    if (!r.id || !r.priceCNY) continue;
    stmt.run(r.id, r.species || "", r.locality || "", r.sizeCm || 0, Math.round(r.priceCNY), r.status || "list", r.channel || "", r.note || "", r.date || today, r.url || "", "pipeline", now);
    n++;
  }
  console.log(`SQLite 本地持久化: ${n} 行`);
} catch (e) {
  console.log("SQLite 不可用（CI 环境正常）:", e.message.slice(0, 40));
}
