import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../data/live", import.meta.url));
const outRoot = fileURLToPath(new URL("./out", import.meta.url));

function readReport(name) {
  try {
    const p = `${outRoot}/${name}/browser_orchestrator_report.json`;
    if (!existsSync(p)) return null;
    const r = JSON.parse(readFileSync(p, "utf8"));
    return r.attempts?.find((a) => a.ok) || null;
  } catch {
    return null;
  }
}

const feed = [];
const report = [];

function hoursAgoOf(dateStr) {
  if (!dateStr) return 24;
  if (dateStr.includes("小时前")) return parseInt(dateStr) || 1;
  if (dateStr.includes("分钟前")) return 0;
  if (dateStr.includes("天前")) return (parseInt(dateStr) || 1) * 24;
  const m = dateStr.match(/(\d{2})-(\d{2})/);
  if (m) return (Date.now() - new Date(`2026-${m[1]}-${m[2]}`).getTime()) / 3600000;
  return 24 * 7;
}

const bili = readReport("bili");
if (bili?.outputs?.items?.length) {
  const seen = new Set();
  let n = 0;
  for (const it of bili.outputs.items) {
    if (!it.link || seen.has(it.link)) continue;
    seen.add(it.link);
    const lines = String(it.text || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const play = parseInt(lines[0], 10) || 0;
    feed.push({
      id: `bili-${it.link.slice(-16)}`,
      platform: "B站",
      source: it.author || "B站搜索",
      title: `${it.title}${it.date ? `（${String(it.date).replace(/^·\s*/, "")}）` : ""}`,
      engagement: play ? `播放 ${play.toLocaleString("zh-CN")}` : "最新发布",
      priceTag: /[\u4e00-\u9fa5a-zA-Z\d]{1,6}\s*\d+(\.\d+)?\s*cm/i.test(it.title) ? { label: "标题含尺寸信息", kind: "pending" } : undefined,
      url: it.link,
      hoursAgo: Math.round(hoursAgoOf(String(it.date || ""))),
      live: true,
    });
    n++;
  }
  report.push({ source: "B站（Playwright 浏览器抓取）", count: n, note: `关键词「矿物晶体」最新发布，去重后 ${n} 条` });
}

const weibo = readReport("weibom");
report.push({
  source: "微博",
  count: 0,
  note: weibo ? "移动端/网页端均登录墙，待人工登录一次 profile 后接管" : "未执行",
});

report.push({ source: "Fabre Minerals", count: 0, note: "Cloudflare 人机验证，待 CloakBrowser 完整引擎或人工接管" });

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/social-feed.json`, JSON.stringify(feed, null, 2));
writeFileSync(`${dir}/social.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), total: feed.length, report }, null, 2));
console.log(`社媒热度: ${feed.length} 条真实内容 → data/live/social-feed.json`);
report.forEach((r) => console.log(`  ${r.source}: ${r.count} 条 · ${r.note}`));
