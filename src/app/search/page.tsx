"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { speciesStats, fmtCNY } from "@/lib/analytics";
import { Chip, Empty, SectionTitle } from "@/components/ui";

export default function SearchPage() {
  const { bundle } = useLiveBundle();
  const [q, setQ] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get("q") || "");
  }, []);

  const index = useMemo(() => {
    if (!bundle) return null;
    const ds = buildDataset(bundle);
    const stats = speciesStats(ds.allPrices);
    const statOf = new Map(stats.map((s) => [s.species, s]));
    return {
      species: ds.allSpecies.map((sp) => ({
        name: sp.name,
        count: statOf.get(sp.name)?.sample || 0,
        median: statOf.get(sp.name)?.listMedian ? fmtCNY(statOf.get(sp.name)!.listMedian) : "—",
        href: `/wiki/${encodeURIComponent(sp.slug)}`,
      })),
      prices: ds.allPrices.filter((r) => r.title || r.locality).slice(0, 1200).map((r) => ({
        id: r.id, species: r.species, title: r.title || `${r.species} ${r.locality}`, channel: r.channel,
        price: fmtCNY(r.priceCNY), url: r.url, live: Boolean(r.live || r.manual),
      })),
      feed: ds.allFeed.map((f) => ({ id: f.id, platform: f.platform as string, title: f.title, url: f.url })),
    };
  }, [bundle]);

  if (!index) return <LoadingBlock rows={2} />;

  const kw = q.trim().toLowerCase();
  const hit = (s: string) => s.toLowerCase().includes(kw);
  const species = kw ? index.species.filter((s) => hit(s.name)).slice(0, 8) : [];
  const prices = kw ? index.prices.filter((p) => hit(p.species) || hit(p.title) || hit(p.channel)).slice(0, 15) : [];
  const feed = kw ? index.feed.filter((f) => hit(f.title) || hit(f.platform)).slice(0, 8) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-2">
        <div className="flex items-center gap-2 px-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-stone-400" aria-hidden>
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索矿种 / 标本标题 / 渠道…" className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-stone-400" />
          {q && <button onClick={() => setQ("")} className="shrink-0 rounded-md px-2 py-1 text-xs text-stone-400 hover:bg-stone-100">清空</button>}
        </div>
      </div>

      {!kw && <Empty>输入关键词开始搜索 · 支持中英文矿名（如 萤石 / fluorite）、产地、渠道</Empty>}

      {kw && species.length > 0 && (
        <section>
          <SectionTitle>矿种档案</SectionTitle>
          <div className="space-y-2">
            {species.map((s) => (
              <Link key={s.name} href={s.href} className="card card-hover flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-stone-400">{s.count} 条价格 · 标价中位 {s.median}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {kw && prices.length > 0 && (
        <section>
          <SectionTitle>价格记录</SectionTitle>
          <div className="card divide-y divide-stone-100">
            {prices.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="block truncate text-[13px] hover:text-primary-500">{p.title} ↗</a>
                  ) : (
                    <p className="truncate text-[13px]">{p.title}</p>
                  )}
                  <p className="text-[11px] text-stone-400">{p.species} · {p.channel}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.live ? <Chip kind="live">真实</Chip> : <Chip kind="demo">演示</Chip>}
                  <span className="text-sm font-medium tabular">{p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {kw && feed.length > 0 && (
        <section>
          <SectionTitle>情报内容</SectionTitle>
          <div className="card divide-y divide-stone-100">
            {feed.map((f) => (
              <div key={f.id} className="px-4 py-2.5 text-[13px]">
                <Chip kind="muted">{f.platform}</Chip>
                <span className="ml-2">
                  {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500">{f.title} ↗</a> : f.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {kw && species.length + prices.length + feed.length === 0 && <Empty>没有匹配「{q}」的结果</Empty>}
    </div>
  );
}
