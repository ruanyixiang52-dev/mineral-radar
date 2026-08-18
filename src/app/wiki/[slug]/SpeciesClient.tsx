"use client";

import Link from "next/link";
import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { speciesStats, fmtCNY, statusLabel, pricePerCmMedian } from "@/lib/analytics";
import { SectionTitle, StatCard, Chip } from "@/components/ui";

export default function SpeciesClient({ slug }: { slug: string }) {
  const { bundle } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={3} />;
  const ds = buildDataset(bundle);
  let name = slug;
  try {
    name = decodeURIComponent(slug);
  } catch {}
  const sp = ds.allSpecies.find((s) => s.slug === name || s.name === name);
  if (!sp) {
    return (
      <div className="card p-8 text-center text-sm text-stone-400">
        未找到「{name}」档案 · <Link href="/wiki" className="text-primary-500">返回百科</Link>
      </div>
    );
  }
  const st = speciesStats(ds.allPrices, sp.name)[0];
  const records = (st?.records || []).slice(0, 14);
  const perCm = st ? pricePerCmMedian(st.records) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-stone-400">
        <Link href="/wiki" className="transition-colors hover:text-primary-500">品种百科</Link>
        <span>/</span>
        <span className="text-stone-600">{sp.name}</span>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {sp.name}
              {sp.en && <span className="ml-2.5 text-sm font-normal text-stone-400">{sp.en}</span>}
            </h1>
            <p className="mt-1 text-xs text-stone-400">化学成分 {sp.chemistry} · 晶系 {sp.crystalSystem}</p>
          </div>
          {sp.chemistry === "待补充" ? <Chip kind="muted">自动生成档案</Chip> : <Chip kind="platform">完整档案</Chip>}
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-stone-700">{sp.desc}</p>
        {sp.localities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sp.localities.map((l) => (
              <Link key={l} href={`/search?q=${encodeURIComponent(l)}`} className="rounded-full border border-primary-100 bg-primary-50/60 px-2.5 py-0.5 text-[11px] text-primary-500 transition-colors hover:border-primary-200">
                {l}
              </Link>
            ))}
          </div>
        )}
      </div>

      {st && (
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="标价中位数" value={st.listMedian ? fmtCNY(st.listMedian) : "—"} sub={`${st.sample} 条样本 · 真实 ${st.liveSample}`} />
          <StatCard label="成交中位数" value={st.dealMedian ? fmtCNY(st.dealMedian) : "待接入"} tone="down" />
          <StatCard label="标价溢价" value={st.spread !== null ? `+${st.spread}%` : "样本不足"} tone="price" />
          <StatCard label="单位尺寸价" value={perCm ? `¥${perCm}/cm` : "—"} sub="中位 · ¥每厘米" />
        </div>
      )}

      <section>
        <SectionTitle action={<Link href="/compare" className="text-xs text-stone-400 hover:text-primary-500">多渠道比价 →</Link>}>
          近期价格记录
        </SectionTitle>
        <div className="card divide-y divide-stone-100">
          {records.length === 0 && <p className="p-5 text-sm text-stone-400">暂无价格记录，等待爬虫接入或手动录入。</p>}
          {records.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-stone-800">
                  {r.title || `${r.species} ${r.locality}`}
                  {r.coMinerals && r.coMinerals.length > 0 && <span className="ml-1.5 text-[11px] text-stone-400">共生 {r.coMinerals.join("/")}</span>}
                </p>
                <p className="text-[11px] text-stone-400">
                  {statusLabel(r.status)} · {r.channel} · {r.locality} {r.sizeCm ? `· ${r.sizeCm}cm` : ""} · {r.date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`text-[14px] font-medium tabular ${r.status === "deal" ? "text-down" : "text-stone-900"}`}>{fmtCNY(r.priceCNY)}</span>
                {r.manual ? <Chip kind="platform">录入</Chip> : r.live ? <Chip kind="live">真实</Chip> : <Chip kind="demo">演示</Chip>}
                {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline">来源 ↗</a>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
