import { PriceRecordX } from "@/lib/derive";
import { PriceStatus } from "@/data/seed";

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function quantile(nums: number[], q: number): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return Math.round(s[base + 1] !== undefined ? s[base] + rest * (s[base + 1] - s[base]) : s[base]);
}

export function sizeBucket(sizeCm: number): string {
  if (sizeCm && sizeCm < 5) return "mini(<5cm)";
  if (sizeCm >= 5 && sizeCm < 8) return "small(5-8cm)";
  if (sizeCm >= 8 && sizeCm < 12) return "mid(8-12cm)";
  if (sizeCm >= 12) return "large(>12cm)";
  return "未知尺寸";
}

export interface Group {
  key: string;
  species: string;
  locality: string;
  records: PriceRecordX[];
}

export function groupBySpecimen(records: PriceRecordX[]): Group[] {
  const map = new Map<string, Group>();
  for (const r of records) {
    const key = `${r.species}|${r.locality}`;
    if (!map.has(key)) map.set(key, { key, species: r.species, locality: r.locality, records: [] });
    map.get(key)!.records.push(r);
  }
  return [...map.values()].sort((a, b) => b.records.length - a.records.length);
}

export function byStatus(records: PriceRecordX[], status: PriceStatus) {
  return records.filter((r) => r.status === status);
}

export interface FairRange {
  p25: number;
  p75: number;
  median: number;
  sample: number;
}

export function fairRange(records: PriceRecordX[]): FairRange | null {
  const deals = byStatus(records, "deal").map((r) => r.priceCNY);
  if (deals.length < 2) return null;
  return { p25: quantile(deals, 0.25), p75: quantile(deals, 0.75), median: median(deals), sample: deals.length };
}

export function listRange(records: PriceRecordX[]): FairRange | null {
  const lists = byStatus(records, "list").map((r) => r.priceCNY);
  if (lists.length < 2) return null;
  return { p25: quantile(lists, 0.25), p75: quantile(lists, 0.75), median: median(lists), sample: lists.length };
}

export function spreadRate(records: PriceRecordX[]): number | null {
  const lists = byStatus(records, "list").map((r) => r.priceCNY);
  const deals = byStatus(records, "deal").map((r) => r.priceCNY);
  if (!lists.length || !deals.length) return null;
  return Math.round((median(lists) / median(deals) - 1) * 100);
}

export interface SpeciesStat {
  species: string;
  listMedian: number;
  dealMedian: number;
  fair: FairRange | null;
  spread: number | null;
  sample: number;
  liveSample: number;
  records: PriceRecordX[];
}

export function speciesStats(allPrices: PriceRecordX[], species?: string): SpeciesStat[] {
  const groups = groupBySpecimen(allPrices).filter((g) => !species || g.species === species);
  const bySpecies = new Map<string, PriceRecordX[]>();
  for (const g of groups) {
    if (!bySpecies.has(g.species)) bySpecies.set(g.species, []);
    bySpecies.set(g.species, [...bySpecies.get(g.species)!, ...g.records]);
  }
  return [...bySpecies.entries()]
    .map(([sp, records]) => ({
      species: sp,
      listMedian: median(byStatus(records, "list").map((r) => r.priceCNY)),
      dealMedian: median(byStatus(records, "deal").map((r) => r.priceCNY)),
      fair: fairRange(records),
      spread: spreadRate(records),
      sample: records.length,
      liveSample: records.filter((r) => r.live).length,
      records: records.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.sample - a.sample);
}

const BASE_INDEX = 1000;

export function pricePerCmMedian(records: PriceRecordX[]): number | null {
  const vals = records.filter((r) => r.sizeCm > 0 && r.priceCNY > 0).map((r) => Math.round(r.priceCNY / r.sizeCm));
  if (vals.length < 2) return null;
  return median(vals);
}

export function compositeIndex(allPrices: PriceRecordX[], historySeries?: { dates: string[]; values: number[] } | null): { value: number; series: number[]; dates: string[]; fromHistory: boolean } {
  if (historySeries && historySeries.values.length >= 2) {
    return {
      value: historySeries.values[historySeries.values.length - 1],
      series: historySeries.values,
      dates: historySeries.dates,
      fromHistory: true,
    };
  }
  const series: number[] = [];
  const dates = [...new Set(allPrices.map((r) => r.date))].sort();
  let last = BASE_INDEX;
  for (const d of dates) {
    const upto = allPrices.filter((r) => r.date <= d);
    const vals = [...new Set(upto.map((r) => r.species))]
      .map((sp) => {
        const deals = upto.filter((r) => r.species === sp && r.status === "deal").map((r) => r.priceCNY);
        const lists = upto.filter((r) => r.species === sp && r.status === "list").map((r) => r.priceCNY);
        return deals.length ? median(deals) : lists.length ? median(lists) : 0;
      })
      .filter(Boolean);
    last = vals.length ? Math.round((vals.reduce((a, b) => a + Math.log10(b), 0) / vals.length / 3.3) * BASE_INDEX) : last;
    series.push(last);
  }
  return { value: series[series.length - 1] || BASE_INDEX, series, dates, fromHistory: false };
}

export function fmtCNY(n: number): string {
  if (n >= 100000000) return `¥${(n / 100000000).toFixed(2)}亿`;
  if (n >= 10000) return `¥${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万`;
  return `¥${n.toLocaleString("zh-CN")}`;
}

export function statusLabel(s: PriceStatus): string {
  return s === "list" ? "标价" : s === "quote" ? "报价" : "成交";
}
