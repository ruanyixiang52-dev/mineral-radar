import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "矿标雷达 MineralRadar",
  description: "矿物标本行业情报站：价格行情、多渠道比价、内容雷达与品种百科",
};

const nav = [
  { href: "/", label: "首页" },
  { href: "/compare", label: "比价" },
  { href: "/radar", label: "雷达" },
  { href: "/wiki", label: "百科" },
  { href: "/trends", label: "趋势" },
  { href: "/daily", label: "日报" },
  { href: "/sources", label: "数据源" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#F6F5F2]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 lg:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary-500 to-primary-800">
                <span className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/20" aria-hidden />
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 1L14 5v6L8 15L2 11V5L8 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M8 4.5L11 6.5v3L8 11.5L5 9.5v-3L8 4.5Z" fill="white" fillOpacity="0.6" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-stone-900">矿标雷达</span>
              <span className="hidden text-[11px] text-stone-400 sm:inline">MineralRadar</span>
            </Link>
            <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto text-[13px]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-2.5 py-1.5 whitespace-nowrap text-stone-600 transition-colors hover:bg-primary-50 hover:text-primary-500">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/admin" title="手动录入国内成交" className="hidden shrink-0 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-500 transition-colors hover:border-primary-200 hover:text-primary-500 md:block">
              录入成交
            </Link>
            <Link href="/search" className="hidden shrink-0 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-primary-200 hover:text-primary-500 md:flex">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              搜索矿种 / 标本 / 价格
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-stone-400 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/70 pt-4">
            <span>矿标雷达 MineralRadar · 矿物标本行业情报站</span>
            <span>真实数据来自国际矿商官网公开标价 · 展示为摘要+来源+跳原文 · 部分国内渠道数据为演示样本</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
