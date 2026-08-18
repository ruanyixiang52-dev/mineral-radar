"use client";

import { useState } from "react";
import { useLiveBundle, LoadingBlock, SourceBadge } from "@/lib/useLiveBundle";
import { buildDataset, topics } from "@/lib/derive";
import { Chip, PlatformBadge, Empty } from "@/components/ui";

const PLATFORMS = ["全部", "官网", "抖音", "B站", "微博", "小红书", "贴吧", "公众号", "拍卖"];

export default function RadarPage() {
  const { bundle, source, updatedAt } = useLiveBundle();
  const [current, setCurrent] = useState("全部");
  if (!bundle) return <LoadingBlock rows={4} />;
  const ds = buildDataset(bundle);
  const feed = ds.allFeed;
  const items = current === "全部" ? feed : feed.filter((f) => f.platform === current);
  const count = (p: string) => (p === "全部" ? feed.length : feed.filter((f) => f.platform === p).length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight">内容雷达</h1>
        <SourceBadge source={source} updatedAt={updatedAt} />
      </div>

      <div className="sticky top-[52px] z-10 -mx-4 border-b border-stone-200/70 bg-[#F6F5F2]/95 px-4 py-3 backdrop-blur-md lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setCurrent(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${current === p ? "bg-primary-500 text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-primary-200 hover:text-primary-500"}`}
            >
              {p} <span className={current === p ? "text-white/70" : "text-stone-400"}>{count(p)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr,1fr]">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {items.length === 0 && <Empty>该平台暂无内容，等待爬虫接入（见数据源状态页）。</Empty>}
          {items.map((f) => (
            <div key={f.id} className="card card-hover flex flex-col p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={f.platform} />
                  {f.live ? <Chip kind="live">真实抓取</Chip> : <Chip kind="demo">演示</Chip>}
                </div>
                <span className="text-[11px] text-stone-400">{f.hoursAgo} 小时前</span>
              </div>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-stone-800">
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-500">{f.title} ↗</a>
                ) : f.title}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                <span>{f.source} · {f.engagement}</span>
                {f.priceTag && (
                  <Chip kind={f.priceTag.kind === "extracted" ? "price" : f.priceTag.kind === "deal" ? "deal" : "pending"}>{f.priceTag.label}</Chip>
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[13px] font-medium">
              <span className="h-3.5 w-1 rounded-full bg-price" aria-hidden />话题热度榜
            </h2>
            <div className="space-y-2.5">
              {topics.map((t) => (
                <div key={t.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-stone-700">{t.name}</span>
                    <span className="text-stone-400">热度 {t.heat}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-1.5 rounded-full bg-price" style={{ width: `${t.heat}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4 text-[11px] leading-relaxed text-stone-500">
            <p className="mb-1.5 font-medium text-stone-700">数据说明</p>
            <p className="mb-1">· 官网与B站内容为云端自动抓取：摘要 + 来源 + 跳原文，不整篇搬运。</p>
            <p className="mb-1">· 微博（登录墙）/抖音/小红书为演示数据，攻坚中。</p>
            <p>· 每条内容上的价格标注会反哺价格数据库。</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
