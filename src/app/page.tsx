"use client";

import Link from "next/link";
import { useLiveBundle, LoadingBlock, SourceBadge } from "@/lib/useLiveBundle";
import { buildDataset, topics, hotKeywords } from "@/lib/derive";
import { compositeIndex, fmtCNY, speciesStats, byStatus, pricePerCmMedian } from "@/lib/analytics";
import { SectionTitle, StatCard, Chip, PlatformBadge, AreaChart, HBar, Delta } from "@/components/ui";

export default function HomePage() {
  const { bundle, source, updatedAt } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={4} />;
  const ds = buildDataset(bundle);
  const { value: indexValue, series, dates, fromHistory } = compositeIndex(ds.allPrices, ds.series);
  const stats = speciesStats(ds.allPrices);
  const dealTotal = byStatus(ds.allPrices.filter((r) => !r.live), "deal").reduce((s, r) => s + r.priceCNY, 0);
  const liveCount = ds.livePrices.length;
  const sourceCount = ds.liveMeta.report.length + (ds.socialMeta.total > 0 ? ds.socialMeta.report.length : 0);
  const perCm = pricePerCmMedian(ds.livePrices);
  const idxDelta = series.length >= 2 ? ((series[series.length - 1] - series[0]) / series[0]) * 100 : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SourceBadge source={source} updatedAt={updatedAt} />
        <span className="text-[11px] text-stone-400">{fromHistory ? "SQLite 历史序列" : "当日样本"} · {dates.length} 个采样日</span>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-wide text-stone-500">矿标综合价格指数 · 对数加权</p>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span className="text-[40px] font-semibold leading-none tracking-tight tabular text-primary-500">
                  {indexValue.toLocaleString("zh-CN")}
                </span>
                <Delta pct={idxDelta} />
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">{liveCount.toLocaleString("zh-CN")} 条真实标价 · 每 30 分钟云端自动更新</p>
            </div>
            <div className="flex gap-1.5">
              <Link href="/trends" className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-600 transition-colors hover:border-primary-200 hover:text-primary-500">走势分析</Link>
              <Link href="/compare" className="rounded-lg bg-primary-500 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-primary-600">去比价</Link>
            </div>
          </div>
          <div className="mt-3">
            <AreaChart values={series} labels={dates.map((d) => (d.length > 10 ? d.slice(5).replace("T", " ") : d.slice(5)))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="真实标价条目" value={liveCount.toLocaleString("zh-CN")} sub={`${sourceCount} 个已接入源`} tone="primary" />
          <StatCard label="覆盖矿种" value={`${ds.allSpecies.length}`} sub="档案持续自动生成" />
          <StatCard label="监测成交额" value={fmtCNY(dealTotal)} sub="国内源演示样本" tone="down" />
          <StatCard label="单位尺寸价中位" value={perCm ? `¥${perCm}/cm` : "—"} sub="全库标价 · ¥每厘米" tone="price" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.6fr,1fr]">
        <section>
          <SectionTitle action={<Link href="/radar" className="text-xs text-stone-400 transition-colors hover:text-primary-500">全部内容 →</Link>}>
            今日情报流
          </SectionTitle>
          <div className="space-y-2.5">
            {ds.allFeed.slice(0, 6).map((f) => (
              <div key={f.id} className="card card-hover px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge platform={f.platform} />
                    <span className="text-[12px] text-stone-400">{f.source}</span>
                    {f.live ? <Chip kind="live">真实抓取</Chip> : <Chip kind="demo">演示</Chip>}
                  </div>
                  <span className="text-[11px] text-stone-400">{f.hoursAgo} 小时前</span>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-stone-800">
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-500">{f.title} ↗</a>
                  ) : f.title}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{f.engagement}</span>
                  {f.priceTag && (
                    <Chip kind={f.priceTag.kind === "extracted" ? "price" : f.priceTag.kind === "deal" ? "deal" : "pending"}>{f.priceTag.label}</Chip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section>
            <SectionTitle action={<Link href="/compare" className="text-xs text-stone-400 hover:text-primary-500">行情 →</Link>}>
              矿种热度榜
            </SectionTitle>
            <div className="card space-y-3 p-4">
              {stats.slice(0, 7).map((s, i) => (
                <HBar
                  key={s.species}
                  label={`${i + 1} · ${s.species}`}
                  value={s.sample}
                  max={stats[0].sample}
                  right={`${s.sample} 条${s.liveSample ? ` / 真${s.liveSample}` : ""}`}
                  href={`/wiki/${encodeURIComponent(s.species)}`}
                  tone={i === 0 ? "bg-primary-500" : i < 3 ? "bg-primary-400" : "bg-primary-200"}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>话题热度</SectionTitle>
            <div className="card space-y-3 p-4">
              {topics.map((t) => (
                <HBar key={t.name} label={t.name} value={t.heat} max={100} right={`热度 ${t.heat}`} tone="bg-price" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>热搜关键词</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {hotKeywords.map((k) => (
                <Link key={k} href={`/search?q=${encodeURIComponent(k)}`} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600 transition-colors hover:border-primary-200 hover:text-primary-500">
                  {k}
                </Link>
              ))}
            </div>
          </section>

          <Link href="/daily" className="card card-hover flex items-center justify-between px-4 py-3 text-xs">
            <span className="text-stone-700">今日《矿标情报日报》</span>
            <span className="text-primary-500">阅读 →</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
