"use client";

import Link from "next/link";
import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { compositeIndex, speciesStats, fmtCNY, byStatus } from "@/lib/analytics";
import { StatCard, SectionTitle } from "@/components/ui";

export default function DailyPage() {
  const { bundle } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={3} />;
  const ds = buildDataset(bundle);
  const { value } = compositeIndex(ds.allPrices, ds.series);
  const today = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  const liveCount = ds.livePrices.length;
  const topLive = [...ds.livePrices].sort((a, b) => b.priceCNY - a.priceCNY).slice(0, 6);
  const cheapLive = ds.livePrices.filter((r) => r.priceCNY < 720).length;
  const stats = speciesStats(ds.allPrices);
  const dealDemo = byStatus(ds.allPrices.filter((r) => !r.live), "deal").slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <p className="text-[11px] tracking-[0.2em] text-stone-400">MINERALRADAR DAILY</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">矿标情报日报</h1>
        <p className="mt-1 text-xs text-stone-500">{today}</p>
      </div>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="综合指数" value={value.toLocaleString("zh-CN")} tone="primary" />
        <StatCard label="今日真实标价" value={`${liveCount}`} />
        <StatCard label="千元内标价" value={`${cheapLive}`} sub="入门参考" />
      </section>

      <section>
        <SectionTitle>今日高价标价（国际官网）</SectionTitle>
        <div className="card divide-y divide-stone-100">
          {topLive.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate text-[13px] transition-colors hover:text-primary-500">
                  {r.title} ↗
                </a>
                <p className="text-[11px] text-stone-400">{r.channel} · {r.sizeCm ? `${r.sizeCm}cm · ` : ""}{r.note}</p>
              </div>
              <span className="shrink-0 text-[14px] font-medium tabular">{fmtCNY(r.priceCNY)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>热门矿种行情</SectionTitle>
        <div className="card p-4">
          <table className="w-full text-xs">
            <tbody>
              {stats.slice(0, 6).map((s) => (
                <tr key={s.species} className="border-b border-stone-50 last:border-0">
                  <td className="py-2.5">
                    <Link href={`/wiki/${encodeURIComponent(s.species)}`} className="transition-colors hover:text-primary-500">{s.species}</Link>
                  </td>
                  <td className="py-2.5 text-right tabular text-stone-400">{s.sample} 条</td>
                  <td className="py-2.5 text-right font-medium tabular">{s.listMedian ? fmtCNY(s.listMedian) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-right text-[10px] text-stone-400">标价中位数</p>
        </div>
      </section>

      {dealDemo.length > 0 && (
        <section>
          <SectionTitle>近期成交（演示 · 国内源待接入）</SectionTitle>
          <div className="card divide-y divide-stone-100">
            {dealDemo.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span>{r.species} · {r.locality} {r.sizeCm ? `${r.sizeCm}cm` : ""}</span>
                <span className="font-medium text-down">{fmtCNY(r.priceCNY)} · {r.channel}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>情报精选</SectionTitle>
        <div className="space-y-2">
          {ds.allFeed.slice(0, 6).map((f) => (
            <p key={f.id} className="text-[13px] leading-relaxed">
              <span className="chip mr-2 bg-stone-100 text-stone-600">{f.platform}</span>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-500">{f.title} ↗</a>
              ) : f.title}
            </p>
          ))}
        </div>
      </section>

      <p className="border-t border-stone-200/70 pt-4 text-center text-[11px] text-stone-400">
        {[ds.liveMeta.fetchedAt && `官网数据 ${new Date(ds.liveMeta.fetchedAt).toLocaleString("zh-CN")}`, ds.socialMeta.fetchedAt && `社媒数据 ${new Date(ds.socialMeta.fetchedAt).toLocaleString("zh-CN")}`, "每 30 分钟云端自动更新"]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}
