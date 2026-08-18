"use client";

import { useMemo, useState } from "react";
import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset, PriceRecordX } from "@/lib/derive";
import { groupBySpecimen, fairRange, listRange, spreadRate, median, fmtCNY, statusLabel, byStatus, speciesStats, pricePerCmMedian } from "@/lib/analytics";
import { Chip, Empty } from "@/components/ui";

export default function ComparePage() {
  const { bundle } = useLiveBundle();
  const [species, setSpecies] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const data = useMemo(() => {
    if (!bundle) return null;
    const ds = buildDataset(bundle);
    const allGroups = groupBySpecimen(ds.allPrices).filter((g) => g.records.length >= 2);
    const chips = speciesStats(ds.allPrices).slice(0, 12).map((s) => ({ name: s.species, count: s.sample }));
    const groups = allGroups.map((g) => {
      const fair = fairRange(g.records);
      const lRange = listRange(g.records);
      const sortKey = (r: PriceRecordX) => ({ deal: 0, quote: 1, list: 2 }[r.status] * 10000 + -r.priceCNY);
      return {
        key: g.key,
        species: g.species,
        locality: g.locality,
        liveCount: g.records.filter((r) => r.live || r.manual).length,
        fairText: lRange ? `${fmtCNY(lRange.p25)}–${fmtCNY(lRange.p75)}` : "样本不足",
        fairSub: lRange ? `${lRange.sample} 条标价样本` : "等待更多数据",
        perCm: pricePerCmMedian(g.records),
        spread: spreadRate(g.records),
        dealFairText: fair ? `${fmtCNY(fair.p25)}–${fmtCNY(fair.p75)}（${fair.sample} 笔成交样本）` : undefined,
        rows: [...g.records].sort((a, b) => sortKey(a) - sortKey(b)).slice(0, 3).map((r) => ({
          id: r.id, status: statusLabel(r.status), channel: r.channel, priceText: fmtCNY(r.priceCNY),
          sizeDate: `${r.sizeCm ? `${r.sizeCm}cm · ` : ""}${r.date.slice(5)}`, live: Boolean(r.live || r.manual), url: r.url,
        })),
      };
    });
    const listPrices = byStatus(ds.allPrices, "list").map((r) => r.priceCNY);
    const dealPrices = byStatus(ds.allPrices, "deal").map((r) => r.priceCNY);
    const overallSpread = listPrices.length && dealPrices.length ? Math.round((median(listPrices) / median(dealPrices) - 1) * 100) : null;
    const perCm = pricePerCmMedian(ds.allPrices);
    return { chips, groups, overview: {
      listMedian: listPrices.length ? fmtCNY(median(listPrices)) : "—",
      dealMedian: dealPrices.length ? fmtCNY(median(dealPrices)) : "待接入",
      spread: overallSpread !== null ? `+${overallSpread}%` : "样本不足",
      perCm: perCm ? `¥${perCm}/cm` : "—",
    }, total: ds.allPrices.length };
  }, [bundle]);

  if (!data) return <LoadingBlock rows={5} />;

  const filtered = species ? data.groups.filter((g) => g.species === species) : data.groups;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const visible = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  return (
    <div className="space-y-4">
      <div className="sticky top-[52px] z-10 -mx-4 border-b border-stone-200/70 bg-[#F6F5F2]/95 px-4 py-3 backdrop-blur-md lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => { setSpecies(""); setPage(1); }} className={`chip cursor-pointer ${!species ? "bg-primary-500 !text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-primary-200"}`}>全部 {data.groups.length} 组</button>
          {data.chips.map((c) => (
            <button key={c.name} onClick={() => { setSpecies(species === c.name ? "" : c.name); setPage(1); }} className={`chip cursor-pointer ${species === c.name ? "bg-primary-500 !text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-primary-200"}`}>
              {c.name} {c.count}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card p-3.5"><p className="text-[11px] text-stone-500">标价中位数</p><p className="mt-0.5 text-xl font-medium tabular">{data.overview.listMedian}</p></div>
        <div className="card p-3.5"><p className="text-[11px] text-stone-500">成交中位数</p><p className="mt-0.5 text-xl font-medium tabular text-down">{data.overview.dealMedian}</p></div>
        <div className="card p-3.5"><p className="text-[11px] text-stone-500">整体标价溢价</p><p className="mt-0.5 text-xl font-medium tabular text-price">{data.overview.spread}</p></div>
        <div className="card p-3.5"><p className="text-[11px] text-stone-500">单位尺寸价</p><p className="mt-0.5 text-xl font-medium tabular">{data.overview.perCm}</p></div>
      </div>

      {visible.length === 0 && <Empty>该矿种暂无足够样本，等待抓取或手动录入（/admin）。</Empty>}

      <div className="space-y-3">
        {visible.map((g) => (
          <div key={g.key} className="card card-hover p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[14px] font-semibold tracking-tight">
                {g.species}
                <span className="ml-1.5 font-normal text-stone-400">·</span>
                <span className="ml-1.5 font-normal text-stone-500">{g.locality}</span>
                {g.liveCount > 0 && <Chip kind="live">真实 {g.liveCount}</Chip>}
              </h2>
              <div className="flex items-center gap-1.5">
                {g.perCm && <Chip kind="muted">≈¥{g.perCm}/cm</Chip>}
                {g.spread !== null && <Chip kind="price">标价溢价 +{g.spread}%</Chip>}
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {g.rows.map((r) => (
                <div key={r.id} className={`rounded-xl p-2.5 text-center ${r.status === "deal" ? "bg-downBg/50" : r.live ? "bg-primary-50/50" : "bg-stone-50"}`}>
                  <p className="text-[11px] text-stone-400">{r.status} · {r.channel}</p>
                  <p className={`mt-0.5 text-[16px] font-medium tabular ${r.status === "deal" ? "text-down" : "text-stone-900"}`}>{r.priceText}</p>
                  <p className="mt-0.5 text-[11px] text-stone-400">{r.sizeDate}</p>
                  {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary-500 hover:underline">来源 ↗</a>}
                </div>
              ))}
              <div className="rounded-xl bg-price-bg p-2.5 text-center">
                <p className="text-[11px] text-price">合理区间 P25–P75</p>
                <p className="mt-0.5 text-[16px] font-medium tabular text-price">{g.fairText}</p>
                <p className="mt-0.5 text-[11px] text-price/70">{g.fairSub}</p>
              </div>
            </div>
            {g.dealFairText && <p className="mt-2 text-[11px] text-down">成交区间 {g.dealFairText}</p>}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={pageSafe <= 1} onClick={() => setPage(pageSafe - 1)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-stone-600 transition-colors hover:border-primary-200 disabled:opacity-40">上一页</button>
          <span className="text-xs text-stone-400">第 {pageSafe} / {totalPages} 页</span>
          <button disabled={pageSafe >= totalPages} onClick={() => setPage(pageSafe + 1)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-stone-600 transition-colors hover:border-primary-200 disabled:opacity-40">下一页</button>
        </div>
      )}

      <p className="text-center text-[11px] text-stone-400">● 真实抓取 · ○演示样本 · 共 {data.total} 条 · 数据每 30 分钟云端自动更新</p>
    </div>
  );
}
