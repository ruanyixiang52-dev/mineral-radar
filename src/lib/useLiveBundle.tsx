"use client";

import { useEffect, useState } from "react";
import { CDN_DATA_URL } from "@/config";
import type { LiveBundle } from "@/lib/derive";

export type BundleSource = "local" | "cdn" | "cdn-stale";

export function useLiveBundle() {
  const [bundle, setBundle] = useState<LiveBundle | null>(null);
  const [source, setSource] = useState<BundleSource>("local");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/live-bundle.json", { cache: "no-store" });
        if (res.ok) {
          const b: LiveBundle = await res.json();
          if (alive && b.prices?.length) {
            setBundle(b);
            setUpdatedAt(b.generatedAt);
          }
        }
      } catch {}
      try {
        const res = await fetch(CDN_DATA_URL, { cache: "no-store" });
        if (res.ok) {
          const b: LiveBundle = await res.json();
          if (alive && b.prices?.length) {
            setSource("cdn");
            setBundle(b);
            setUpdatedAt(b.generatedAt);
          }
        }
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { bundle, source, updatedAt };
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="数据加载中">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card animate-pulse p-4">
          <div className="h-3 w-1/3 rounded bg-stone-100" />
          <div className="mt-2 h-5 w-2/3 rounded bg-stone-100" />
        </div>
      ))}
      <p className="text-center text-[11px] text-stone-400">正在拉取最新行情数据…</p>
    </div>
  );
}

export function SourceBadge({ source, updatedAt }: { source: BundleSource; updatedAt: string | null }) {
  const label = source === "cdn" ? "云端实时数据" : "站点快照数据";
  return (
    <span className={`chip ${source === "cdn" ? "bg-downBg text-down" : "bg-stone-100 text-stone-500"}`}>
      {label}
      {updatedAt ? ` · ${new Date(updatedAt).toLocaleString("zh-CN")}` : ""}
    </span>
  );
}
