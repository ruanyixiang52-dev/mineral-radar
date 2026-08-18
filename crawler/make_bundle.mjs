import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const live = (n) => {
  try {
    const p = `${root}/data/live/${n}`;
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
  } catch {}
  return null;
};

const bundle = {
  generatedAt: new Date().toISOString(),
  prices: live("prices.json") || [],
  feed: live("feed.json") || [],
  socialFeed: live("social-feed.json") || [],
  liveMeta: live("meta.json") || { fetchedAt: null, total: 0, report: [] },
  socialMeta: live("social.json") || { fetchedAt: null, total: 0, report: [] },
  series: (() => {
    try {
      const p = `${root}/data/history/series.json`;
      if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
    } catch {}
    return null;
  })(),
};

const json = JSON.stringify(bundle);
const pubDir = `${root}/public/data`;
if (!existsSync(pubDir)) mkdirSync(pubDir, { recursive: true });
writeFileSync(`${pubDir}/live-bundle.json`, json);
writeFileSync(`${root}/data/live/live-bundle.json`, JSON.stringify(bundle, null, 2));
console.log(`bundle 打包: prices=${bundle.prices.length} feed=${bundle.feed.length} social=${bundle.socialFeed.length} series=${bundle.series ? bundle.series.values.length + "点" : "无"} → public/data/live-bundle.json`);
