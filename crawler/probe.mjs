const SOURCES = [
  { name: "Fabre Minerals", url: "https://www.fabreminerals.com", type: "dealer" },
  { name: "The Arkenstone (iRocks)", url: "https://www.irocks.com", type: "dealer" },
  { name: "Crystal Classics", url: "https://www.crystalclassics.co.uk", type: "dealer" },
  { name: "Marin Minerals", url: "https://www.marinminerals.com", type: "dealer" },
  { name: "Khyber Minerals", url: "https://www.khyberminerals.com", type: "dealer" },
  { name: "Mindat", url: "https://www.mindat.org", type: "database" },
  { name: "Heritage Auctions", url: "https://historical.ha.com", type: "auction" },
  { name: "MineralAuctions", url: "https://www.mineralauctions.com", type: "auction" },
];

const USD = /\$\s?[\d,]+(?:\.\d{1,2})?/g;
const EUR = /€\s?[\d,]+(?:\.\d{1,2})?/g;
const TITLE = /<title[^>]*>([^<]{0,120})/i;

async function probe(source) {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 MineralRadarProbe/0.1" },
    });
    clearTimeout(timer);
    const html = await res.text();
    const usd = html.match(USD) || [];
    const eur = html.match(EUR) || [];
    const title = (html.match(TITLE) || [])[1]?.trim() || "";
    return {
      ...source,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      bytes: html.length,
      priceHits: usd.length + eur.length,
      samplePrices: [...usd, ...eur].slice(0, 5),
      title,
      verdict:
        res.ok && usd.length + eur.length > 0 ? "可直接抓取（页面含价格字段）" : res.ok ? "可达，价格或需二级页/接口" : "需要进一步处理（登录/反爬/超时）",
    };
  } catch (e) {
    return { ...source, ok: false, status: 0, ms: Date.now() - started, error: String(e).slice(0, 120), verdict: "不可达或被拦截" };
  }
}

console.log("矿标雷达 · 数据源实地探测 v0.1");
console.log("=".repeat(64));
const results = [];
for (const s of SOURCES) {
  const r = await probe(s);
  results.push(r);
  console.log(`${r.ok ? "OK " : "ERR"} [${String(r.ms).padStart(5)}ms] ${r.name.padEnd(26)} ${r.verdict}`);
  if (r.priceHits) console.log(`     价格样本: ${r.samplePrices.join(" | ")}`);
  if (r.error) console.log(`     ${r.error}`);
}
const good = results.filter((r) => r.priceHits > 0).length;
console.log("=".repeat(64));
console.log(`结论: ${good}/${results.length} 个源在首页即含价格字段，可进入第一批爬虫开发。`);
console.log(`报告已生成: crawler/probe-report.json`);
import { writeFileSync } from "node:fs";
writeFileSync(new URL("./probe-report.json", import.meta.url), JSON.stringify(results, null, 2));
