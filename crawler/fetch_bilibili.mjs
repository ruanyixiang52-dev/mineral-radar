import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const OUT_URL = "https://search.bilibili.com/all?keyword=%E7%9F%BF%E7%89%A9%E6%99%B6%E4%BD%93&order=pubdate";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const dir = fileURLToPath(new URL("../data/live", import.meta.url));

const EXTRACTOR = `(() => {
  const cards = Array.from(document.querySelectorAll('div.bili-video-card:not([class*="skeleton"])'));
  return cards.map(c => {
    const t = c.innerText || "";
    if (t.length < 10 || t.length > 600) return null;
    return {
      title: (c.querySelector("h3.bili-video-card__info--tit")?.innerText || c.querySelector("h3")?.innerText || "").trim(),
      link: c.querySelector('a[href*="/video/"]')?.href,
      author: (c.querySelector("span.bili-video-card__info--author")?.innerText || "").trim(),
      date: (c.querySelector("span.bili-video-card__info--date")?.innerText || "").replace(/^·\\s*/, ""),
      text: t.slice(0, 300),
    };
  }).filter(Boolean).slice(0, 30);
})()`;

function hoursAgoOf(dateStr) {
  if (!dateStr) return 24;
  if (dateStr.includes("小时前")) return parseInt(dateStr) || 1;
  if (dateStr.includes("分钟前")) return 0;
  if (dateStr.includes("天前")) return (parseInt(dateStr) || 1) * 24;
  const m = String(dateStr).match(/(\d{2})-(\d{2})/);
  if (m) return Math.round((Date.now() - new Date(`${new Date().getFullYear()}-${m[1]}-${m[2]}`).getTime()) / 3600000);
  return 24 * 7;
}

async function main() {
  console.log("B站热度抓取（独立 Playwright）");
  let raw = [];
  let note = "";
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: UA });
    await page.goto(OUT_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, 3200);
    await page.waitForTimeout(2000);
    raw = await page.evaluate(EXTRACTOR);
    await browser.close();
    note = `关键词「矿物晶体」最新发布 ${raw.length} 条`;
  } catch (e) {
    note = `抓取失败: ${e.message.slice(0, 80)}`;
    console.log("WARN", note);
  }

  const feed = [];
  const seen = new Set();
  for (const it of raw) {
    if (!it.link || seen.has(it.link)) continue;
    seen.add(it.link);
    const lines = String(it.text || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const play = parseInt(lines[0], 10) || 0;
    feed.push({
      id: `bili-${it.link.slice(-16)}`,
      platform: "B站",
      source: it.author || "B站搜索",
      title: `${it.title}${it.date ? `（${it.date}）` : ""}`,
      engagement: play ? `播放 ${play.toLocaleString("zh-CN")}` : "最新发布",
      priceTag: /\d+(\.\d+)?\s*cm/i.test(it.title) ? { label: "标题含尺寸信息", kind: "pending" } : undefined,
      url: it.link,
      hoursAgo: hoursAgoOf(it.date),
      live: true,
    });
  }

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/social-feed.json`, JSON.stringify(feed, null, 2));
  writeFileSync(
    `${dir}/social.json`,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        total: feed.length,
        report: [
          { source: "B站（Playwright 云端抓取）", count: feed.length, note },
          { source: "微博", count: 0, note: "双端登录墙，待人工登录 profile 后接入" },
          { source: "Fabre Minerals", count: 0, note: "Cloudflare 人机验证，待反指纹引擎" },
        ],
      },
      null,
      2
    )
  );
  console.log(`社媒热度: ${feed.length} 条 → data/live/social-feed.json · ${note}`);
}

main().catch((e) => {
  console.error("失败:", e.message);
  process.exit(1);
});
