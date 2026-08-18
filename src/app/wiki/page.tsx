"use client";

import Link from "next/link";
import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { speciesStats, fmtCNY } from "@/lib/analytics";
import { Chip } from "@/components/ui";

const HUES = ["#534AB7", "#0F6E56", "#993C1D", "#185FA5", "#993556", "#854F0B", "#3B6D11", "#A32D2D"];

export default function WikiPage() {
  const { bundle } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={4} />;
  const ds = buildDataset(bundle);
  const stats = speciesStats(ds.allPrices);
  const statOf = new Map(stats.map((s) => [s.species, s]));
  const hueOf = (name: string) => HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight">品种百科</h1>
        <span className="text-xs text-stone-400">
          {ds.allSpecies.filter((s) => s.chemistry !== "待补充").length} 完整 + {ds.allSpecies.filter((s) => s.chemistry === "待补充").length} 自动档案
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ds.allSpecies.map((sp) => {
          const st = statOf.get(sp.name);
          const liveN = ds.livePrices.filter((r) => r.species === sp.name).length;
          return (
            <Link key={sp.slug} href={`/wiki/${encodeURIComponent(sp.slug)}`} className="card card-hover block overflow-hidden">
              <div className="h-1 w-full" style={{ background: hueOf(sp.name) }} aria-hidden />
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[14px] font-semibold tracking-tight">{sp.name}</h2>
                  <span className="text-[10px] text-stone-400">{sp.chemistry === "待补充" ? "AUTO" : sp.chemistry}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 min-h-[2.4em] text-xs leading-relaxed text-stone-500">{sp.desc}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {st && <span className="chip bg-stone-100 text-stone-600">{st.sample} 条价格</span>}
                  {liveN > 0 && <span className="chip bg-downBg text-down">真实 {liveN}</span>}
                  {st?.listMedian ? <span className="chip bg-price-bg text-price">中位 {fmtCNY(st.listMedian)}</span> : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
