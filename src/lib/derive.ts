import { priceRecords as seedPrices, feedItems as seedFeed, speciesList as seedSpecies, topics, hotKeywords, PriceRecord, FeedItem, Species } from "@/data/seed";

export interface PriceRecordX extends PriceRecord {
  live?: boolean;
  manual?: boolean;
  url?: string;
  coMinerals?: string[];
  title?: string;
  mapped?: boolean;
}

export type FeedItemX = FeedItem & { live?: boolean };

export interface LiveBundle {
  generatedAt: string;
  prices: PriceRecordX[];
  feed: FeedItemX[];
  socialFeed: FeedItemX[];
  liveMeta: { fetchedAt: string | null; total: number; report: { source: string; count: number; mapped?: number; note: string }[] };
  socialMeta: { fetchedAt: string | null; total: number; report: { source: string; count: number; note: string }[] };
  series: { dates: string[]; values: number[]; perSpecies?: { species: string; dates: string[]; values: number[] }[] } | null;
}

export interface Dataset {
  allPrices: PriceRecordX[];
  allFeed: FeedItemX[];
  allSpecies: Species[];
  liveMeta: LiveBundle["liveMeta"];
  socialMeta: LiveBundle["socialMeta"];
  series: LiveBundle["series"];
  livePrices: PriceRecordX[];
  manualPrices: PriceRecordX[];
}

export function buildDataset(bundle: LiveBundle): Dataset {
  const livePrices = bundle.prices;
  const seedRecords: PriceRecordX[] = seedPrices.map((r) => ({ ...r, live: false }));
  const liveSpeciesNames = [...new Set(livePrices.filter((r) => r.mapped).map((r) => r.species))];
  const autoSpecies: Species[] = liveSpeciesNames
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
  return {
    allPrices: [...livePrices, ...seedRecords],
    allFeed: [...bundle.feed, ...bundle.socialFeed, ...seedFeed.map((f) => ({ ...f, live: false }))],
    allSpecies: [...seedSpecies, ...autoSpecies],
    liveMeta: bundle.liveMeta,
    socialMeta: bundle.socialMeta,
    series: bundle.series,
    livePrices,
    manualPrices: [],
  };
}

export { seedSpecies, topics, hotKeywords };
