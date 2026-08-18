import Link from "next/link";
import type { ReactNode } from "react";

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="flex items-center gap-2 text-[13px] font-medium tracking-tight text-stone-800">
        <span className="h-3.5 w-1 rounded-full bg-primary-500" aria-hidden />
        {children}
      </h2>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "primary" | "price" | "down" }) {
  const toneCls =
    tone === "primary" ? "text-primary-500" : tone === "price" ? "text-price" : tone === "down" ? "text-down" : "text-stone-900";
  return (
    <div className="card p-4">
      <p className="text-[11px] tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1 font-medium tabular-nums ${toneCls} text-[26px] leading-8 tracking-tight`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-stone-400">{sub}</p>}
    </div>
  );
}

export function Chip({ kind, children }: { kind: "platform" | "live" | "demo" | "price" | "deal" | "pending" | "muted"; children: ReactNode }) {
  const cls: Record<string, string> = {
    platform: "bg-primary-50 text-primary-500",
    live: "bg-downBg text-down",
    demo: "bg-stone-100 text-stone-400",
    price: "bg-price-bg text-price",
    deal: "bg-downBg text-down",
    pending: "bg-stone-100 text-stone-600",
    muted: "bg-stone-100 text-stone-600",
  };
  return <span className={`chip ${cls[kind]}`}>{children}</span>;
}

export function PlatformBadge({ platform }: { platform: string }) {
  const dot: Record<string, string> = {
    官网: "bg-primary-500",
    抖音: "bg-up",
    B站: "bg-blue-500",
    微博: "bg-up",
    小红书: "bg-pink-500",
    贴吧: "bg-stone-400",
    公众号: "bg-teal-500",
    拍卖: "bg-price",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-stone-600">
      <span className={`h-1.5 w-1.5 rounded-full ${dot[platform] || "bg-stone-400"}`} aria-hidden />
      {platform}
    </span>
  );
}

export function AreaChart({ values, labels, height = 150, tone = "#534AB7" }: { values: number[]; labels?: string[]; height?: number; tone?: string }) {
  if (values.length < 2) {
    return (
      <div className="flex h-[150px] items-center justify-center rounded-lg bg-stone-50 text-xs text-stone-400">
        样本积累中 · 每日抓取一次即可形成走势
      </div>
    );
  }
  const w = 720;
  const h = 170;
  const pad = { l: 8, r: 8, t: 16, b: 22 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => pad.l + (i / (values.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / range) * (h - pad.t - pad.b);
  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad.l},${h - pad.b} ${line} ${w - pad.r},${h - pad.b}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="指数走势图">
      <polygon points={area} fill={tone} opacity="0.08" />
      <polyline points={line} fill="none" stroke={tone} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="4" fill={tone} />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="8" fill={tone} opacity="0.2" />
      {labels &&
        labels.map((l, i) =>
          i % Math.ceil(labels.length / 6) === 0 ? (
            <text key={i} x={x(i)} y={h - 6} fontSize="10" fill="#888780" textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}>
              {l}
            </text>
          ) : null
        )}
      <text x={pad.l} y={12} fontSize="10" fill="#888780">{`高 ${max.toLocaleString("zh-CN")}`}</text>
      <text x={w - pad.r} y={12} fontSize="10" fill="#888780" textAnchor="end">{`低 ${min.toLocaleString("zh-CN")}`}</text>
    </svg>
  );
}

export function HBar({ label, value, max, right, href, tone = "bg-primary-500" }: { label: string; value: number; max: number; right?: string; href?: string; tone?: string }) {
  const inner = (
    <>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-stone-700">{label}</span>
        {right && <span className="tabular-nums text-stone-400">{right}</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${Math.max(3, (value / (max || 1)) * 100)}%` }} />
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-md p-1 -mx-1 transition-colors hover:bg-primary-50/50">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

export function Delta({ pct }: { pct: number | null }) {
  if (pct === null || !isFinite(pct)) return <span className="chip bg-stone-100 text-stone-400">—</span>;
  const up = pct >= 0;
  return (
    <span className={`chip ${up ? "bg-upBg text-up" : "bg-downBg text-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card flex items-center justify-center p-8 text-center text-sm text-stone-400">{children}</div>;
}
