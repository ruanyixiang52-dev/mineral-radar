"use client";

import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { compositeIndex, speciesStats, fmtCNY, pricePerCmMedian } from "@/lib/analytics";
import { SectionTitle, AreaChart, HBar } from "@/components/ui";

export default function TrendsPage() {
  const { bundle } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={4} />;
  const ds = buildDataset(bundle);
  const { value, series, dates, fromHistory } = compositeIndex(ds.allPrices, ds.series);
  const stats = speciesStats(ds.allPrices);
  const topBySample = stats.slice(0, 12);
  const maxSample = topBySample[0]?.sample || 1;
  const topByPrice = stats.filter((s) => s.listMedian > 0).sort((a, b) => b.listMedian - a.listMedian).slice(0, 10);
  const withPerCm = stats
    .map((s) => ({ species: s.species, perCm: pricePerCmMedian(s.records) }))
    .filter((x) => x.perCm)
    .sort((a, b) => b.perCm! - a.perCm!)
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight">趋势指数</h1>
        <span className="text-xs text-stone-400">
          {fromHistory ? `云端历史序列 · ${dates.length} 个采样点 · 每 30 分钟自动追加` : "当日样本即时计算"}
        </span>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[13px] font-medium">矿标综合价格指数（各矿种中位数对数加权）</h2>
          <span className="text-2xl font-semibold tabular text-primary-500">{value.toLocaleString("zh-CN")}</span>
        </div>
        <AreaChart values={series} labels={dates.map((d) => (d.length > 10 ? d.slice(5).replace("T", " ") : d.slice(5)))} />
        <p className="text-[11px] text-stone-400">
          样本期 {dates[0] || "—"} 至 {dates[dates.length - 1] || "—"} · 全库 {ds.allPrices.length} 条 · 指数基点 1000
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4">
          <SectionTitle>样本量排行</SectionTitle>
          <div className="space-y-3">
            {topBySample.map((s, i) => (
              <HBar key={s.species} label={`${i + 1} · ${s.species}`} value={s.sample} max={maxSample} right={`${s.sample}`} href={`/wiki/${encodeURIComponent(s.species)}`} tone={i < 3 ? "bg-primary-500" : "bg-primary-200"} />
            ))}
          </div>
        </div>

        <div className="card p-4">
          <SectionTitle>标价中位数 Top 10</SectionTitle>
          <div className="space-y-2">
            {topByPrice.map((s, i) => (
              <div key={s.species} className="flex items-center justify-between text-xs">
                <a href={`/wiki/${encodeURIComponent(s.species)}`} className="text-stone-700 transition-colors hover:text-primary-500">{i + 1} · {s.species}</a>
                <span className="font-medium tabular text-price">{fmtCNY(s.listMedian)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <SectionTitle>单位尺寸价（¥/cm）</SectionTitle>
          {withPerCm.length === 0 && <p className="text-xs text-stone-400">尺寸数据积累中</p>}
          <div className="space-y-2">
            {withPerCm.map((x, i) => (
              <div key={x.species} className="flex items-center justify-between text-xs">
                <a href={`/wiki/${encodeURIComponent(x.species)}`} className="text-stone-700 transition-colors hover:text-primary-500">{i + 1} · {x.species}</a>
                <span className="font-medium tabular">¥{x.perCm}/cm</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-stone-400">单位尺寸价 = 价格 ÷ 主尺寸，用于跨尺寸比较非标品的相对贵贱。</p>
        </div>
      </div>
    </div>
  );
}
