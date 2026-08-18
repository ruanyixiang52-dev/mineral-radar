import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  priceRecords as seedPrices,
  feedItems as seedFeed,
  speciesList as seedSpecies,
  topics,
  hotKeywords,
  PriceRecord,
  FeedItem,
  Species,
} from "@/data/seed";

export interface PriceRecordX extends PriceRecord {
  live?: boolean;
  manual?: boolean;
  url?: string;
  coMinerals?: string[];
  title?: string;
  mapped?: boolean;
}

export type FeedItemX = FeedItem & { live?: boolean };

const liveDir = join(process.cwd(), "data", "live");

function readJson<T>(name: string, fallback: T): T {
  try {
    const p = join(liveDir, name);
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {}
  return fallback;
}

export const liveMeta = readJson<{ fetchedAt: string | null; total: number; report: { source: string; count: number; mapped: number; note: string }[] }>(
  "meta.json",
  { fetchedAt: null, total: 0, report: [] }
);

export const socialMeta = readJson<{ fetchedAt: string | null; total: number; report: { source: string; count: number; note: string }[] }>(
  "social.json",
  { fetchedAt: null, total: 0, report: [] }
);

export const historySeries = readJson<{ dates: string[]; values: number[]; perSpecies: { species: string; dates: string[]; values: number[] }[] } | null>(
  "../history/series.json",
  null
);

const livePricesRaw = readJson<PriceRecordX[]>("prices.json", []);
const liveFeedRaw = readJson<FeedItemX[]>("feed.json", []);
const socialFeedRaw = readJson<FeedItemX[]>("social-feed.json", []);

function parseManualCsv(): PriceRecordX[] {
  const p = join(process.cwd(), "data", "manual", "import.csv");
  if (!existsSync(p)) return [];
  try {
    const lines = readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim());
    return lines
      .map((line, i) => {
        const c = line.split(",").map((s) => s.trim());
        if (i === 0 && /[a-zA-Z]/.test(c[0]) && c[0] !== "矿种" && !/[\u4e00-\u9fa5]/.test(c[0])) return null;
        if (c.length < 5) return null;
        const price = parseInt(c[3], 10);
        if (!isFinite(price) || price <= 0) return null;
        return {
          id: `manual-${i}-${price}`,
          species: c[0],
          locality: c[1] || "未填写",
          sizeCm: parseFloat(c[2]) || 0,
          priceCNY: price,
          status: (c[4] === "成交" || c[4] === "deal" ? "deal" : c[4] === "报价" || c[4] === "quote" ? "quote" : "list") as PriceRecordX["status"],
          channel: c[5] || "手动录入",
          note: c[6] || undefined,
          date: c[7] || new Date().toISOString().slice(0, 10),
          url: c[8] || undefined,
          title: `${c[0]} ${c[1] || ""} ${c[2] ? c[2] + "cm" : ""}`.trim(),
          manual: true,
        } as PriceRecordX;
      })
      .filter(Boolean) as PriceRecordX[];
  } catch {
    return [];
  }
}

export const livePrices: PriceRecordX[] = livePricesRaw;
export const manualPrices: PriceRecordX[] = parseManualCsv();
export const seedPriceRecords: PriceRecordX[] = seedPrices.map((r) => ({ ...r, live: false }));

export const allPrices: PriceRecordX[] = [...livePrices, ...manualPrices, ...seedPriceRecords];

export const socialFeed: FeedItemX[] = socialFeedRaw;
export const allFeed: FeedItemX[] = [...liveFeedRaw, ...socialFeed, ...seedFeed.map((f) => ({ ...f, live: false }))];

export { seedSpecies, topics, hotKeywords };

const liveSpeciesNames = [...new Set(livePrices.filter((r) => r.mapped).map((r) => r.species))];

export const autoSpecies: Species[] = liveSpeciesNames
  .filter((n) => !seedSpecies.some((s) => s.name === n))
  .map((name) => {
    const recs = livePrices.filter((r) => r.species === name);
    return {
      slug: name,
      name,
      en: "",
      chemistry: "待补充",
      crystalSystem: "待补充",
      localities: [...new Set(recs.map((r) => r.locality).filter((l) => l !== "产地待解析"))].slice(0, 6),
      desc: `自动生成档案：当前基于 ${recs.length} 条真实标价数据（${[...new Set(recs.map((r) => r.channel))].join("、")}），详细矿物参数待人工补充。`,
    };
  });

export const allSpecies: Species[] = [...seedSpecies, ...autoSpecies];

export function priceCountOf(species: string) {
  return allPrices.filter((r) => r.species === species).length;
}
