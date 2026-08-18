"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/ui";

const FIELDS = [
  { key: "species", label: "矿种（必填）", placeholder: "如：萤石" },
  { key: "locality", label: "产地", placeholder: "如：贵州晴隆" },
  { key: "size", label: "尺寸 cm", placeholder: "如：6.5" },
  { key: "price", label: "价格 ¥（必填）", placeholder: "如：2800" },
  { key: "channel", label: "渠道", placeholder: "如：微拍堂 / 闲鱼 / 展会现场" },
  { key: "note", label: "备注", placeholder: "如：27次出价 / 与方解石共生" },
  { key: "url", label: "来源链接", placeholder: "https://…" },
];

export default function AdminPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("deal");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addRow = () => {
    if (!form.species || !form.price || !/^\d+$/.test(form.price)) {
      alert("矿种和价格（数字）为必填");
      return;
    }
    setRows((r) => [...r, { ...form, status }]);
    setForm({});
  };

  const csv = () => {
    const header = "species,locality,sizeCm,priceCNY,status,channel,note,url";
    const body = rows.map((r) =>
      [r.species, r.locality || "", r.size || "", r.price, r.status, r.channel || "", r.note || "", r.url || ""]
        .map((s) => String(s).replace(/,/g, "，"))
        .join(",")
    );
    return [header, ...body].join("\n");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">手动录入 · 微拍堂 / 闲鱼 / 展会成交</h1>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          国内电商与拍卖平台有登录墙和风控，自动化抓取不稳定。这里是设计文档里的「半自动兜底」：你刷直播、逛展、闲鱼看到成交，
          30 秒录一条——量小但 100% 真实，且是全网独家的国内成交数据。录满一批后，把下方 CSV 追加到{" "}
          <code className="rounded bg-stone-100 px-1 text-[11px]">data/manual/import.csv</code>，运行{" "}
          <code className="rounded bg-stone-100 px-1 text-[11px]">npm run sync</code> 即入库并刷新全站。
        </p>
      </div>

      <div className="card p-4">
        <SectionTitle>新增记录</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-[11px] text-stone-500">{f.label}</label>
              <input className="input" placeholder={f.placeholder} value={form[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[11px] text-stone-500">价格状态</label>
            <div className="flex gap-1.5">
              {[
                ["deal", "成交"],
                ["quote", "报价"],
                ["list", "标价"],
              ].map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${status === v ? "bg-primary-500 text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-primary-200"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={addRow} className="mt-3 rounded-lg bg-primary-500 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600">
          加入本批
        </button>
      </div>

      {rows.length > 0 && (
        <div className="card p-4">
          <SectionTitle action={
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(csv())} className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-stone-600 hover:border-primary-200">复制 CSV</button>
              <button onClick={() => setRows([])} className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-stone-400 hover:border-up/30 hover:text-up">清空本批</button>
            </div>
          }>
            本批 {rows.length} 条
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-400">
                  <th className="py-2 pr-3 font-normal">矿种</th>
                  <th className="py-2 pr-3 font-normal">产地</th>
                  <th className="py-2 pr-3 font-normal">尺寸</th>
                  <th className="py-2 pr-3 font-normal">价格</th>
                  <th className="py-2 pr-3 font-normal">状态</th>
                  <th className="py-2 font-normal">渠道</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-stone-50 last:border-0">
                    <td className="py-2 pr-3">{r.species}</td>
                    <td className="py-2 pr-3 text-stone-500">{r.locality || "—"}</td>
                    <td className="py-2 pr-3 tabular">{r.size || "—"}</td>
                    <td className="py-2 pr-3 font-medium tabular">¥{Number(r.price).toLocaleString("zh-CN")}</td>
                    <td className="py-2 pr-3 text-stone-500">{r.status === "deal" ? "成交" : r.status === "quote" ? "报价" : "标价"}</td>
                    <td className="py-2 text-stone-500">{r.channel || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-600">{csv()}</pre>
        </div>
      )}
    </div>
  );
}
