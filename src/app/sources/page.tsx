"use client";

import { useLiveBundle, LoadingBlock } from "@/lib/useLiveBundle";
import { buildDataset } from "@/lib/derive";
import { SectionTitle, Chip } from "@/components/ui";

const CATEGORY_MAP = [
  { key: "A", name: "国际矿商官网", status: "云端已接入", tone: "live", detail: "iRocks / Khyber / Crystal Classics · GitHub Actions 每 30 分钟轮换抓取" },
  { key: "B", name: "国际拍卖行", status: "攻坚中", tone: "price", detail: "Heritage / MineralAuctions 反爬，待反指纹引擎" },
  { key: "C", name: "国际电商", status: "计划中", tone: "muted", detail: "eBay 官方 API（需注册 AppKey）、Etsy" },
  { key: "D", name: "国内电商/拍卖", status: "半自动录入", tone: "price", detail: "微拍堂/闲鱼登录墙，走 /admin 手动录入通道" },
  { key: "E", name: "展会与机构", status: "计划中", tone: "muted", detail: "长沙矿博会、桂林矿晶展、图森展" },
  { key: "F", name: "权威数据库", status: "计划中", tone: "muted", detail: "Mindat（反爬+API Key）" },
  { key: "G", name: "社媒/社区", status: "B站已接入", tone: "live", detail: "B站云端自动抓取（Playwright）；微博登录墙；抖音/小红书攻坚中" },
  { key: "H", name: "内容源", status: "计划中", tone: "muted", detail: "公众号历史文章、收藏博客" },
];

export default function SourcesPage() {
  const { bundle } = useLiveBundle();
  if (!bundle) return <LoadingBlock rows={3} />;
  const ds = buildDataset(bundle);
  const channelCount = (ch: string) => ds.livePrices.filter((r) => r.channel === ch).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight">数据源状态</h1>
        <Chip kind="live">云端每 30 分钟自动更新</Chip>
      </div>

      <div className="card p-5">
        <SectionTitle>八类全量数据源地图 · 接入进度</SectionTitle>
        <div className="space-y-2">
          {CATEGORY_MAP.map((c) => (
            <div key={c.key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-stone-50 px-3.5 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[11px] font-medium text-primary-500">{c.key}</span>
              <span className="text-[13px] font-medium">{c.name}</span>
              <Chip kind={c.tone === "live" ? "live" : c.tone === "price" ? "price" : "muted"}>{c.status}</Chip>
              <span className="w-full text-[11px] text-stone-400 sm:w-auto sm:flex-1">{c.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <SectionTitle>官网标价抓取统计</SectionTitle>
          <div className="space-y-2">
            {ds.liveMeta.report.map((r) => (
              <div key={r.source} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-downBg/50 px-3 py-2 text-xs">
                <span className="font-medium">{r.source}</span>
                <span className="text-stone-500">{r.count} 条 · 映射 {r.mapped}</span>
                <Chip kind="live">库内 {channelCount(r.source)}</Chip>
              </div>
            ))}
            {ds.liveMeta.fetchedAt && (
              <p className="text-[11px] text-stone-400">最近抓取 {new Date(ds.liveMeta.fetchedAt).toLocaleString("zh-CN")}</p>
            )}
          </div>
        </div>

        <div className="card p-4">
          <SectionTitle>社媒与手动通道</SectionTitle>
          <div className="space-y-2 text-xs">
            {(ds.socialMeta.report || []).map((r) => (
              <div key={r.source} className="rounded-lg bg-stone-50 px-3 py-2">
                <span className="font-medium">{r.source}</span>
                <span className="ml-2 text-stone-500">{r.count} 条 · {r.note}</span>
              </div>
            ))}
            <div className="rounded-lg bg-primary-50/60 px-3 py-2">
              <span className="font-medium text-primary-500">手动录入</span>
              <span className="ml-2 text-stone-600">/admin 页录入国内成交（微拍堂/闲鱼/展会）</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 text-[11px] leading-relaxed text-stone-500">
        <p className="mb-1 font-medium text-stone-700">合规底线</p>
        只抓公开数据；不抓用户个人信息；控制频率不干扰对方服务；展示只做摘要与数字，不整篇搬运；国内电商/社交源展示时做来源脱敏处理。
      </div>
    </div>
  );
}
