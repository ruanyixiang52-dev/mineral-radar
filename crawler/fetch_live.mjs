import { writeFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const FX = { USD: 7.2, GBP: 9.2, EUR: 7.9 };
const TODAY = new Date().toISOString().slice(0, 10);

const MINERAL_ZH = {
  fluorite: "萤石", aquamarine: "海蓝宝", beryl: "绿柱石", emerald: "祖母绿", morganite: "摩根石", heliodor: "金绿柱石",
  pyrite: "黄铁矿", calcite: "方解石", quartz: "水晶", amethyst: "紫水晶", citrine: "黄水晶", ametrine: "紫黄晶",
  sphalerite: "闪锌矿", galena: "方铅矿", pyromorphite: "磷氯铅矿", cassiterite: "锡石", stibnite: "辉锑矿",
  tourmaline: "碧玺", elbaite: "碧玺", epidote: "绿帘石", apatite: "磷灰石", azurite: "蓝铜矿", malachite: "孔雀石",
  dioptase: "透视石", rhodochrosite: "菱锰矿", rhodonite: "蔷薇辉石", siderite: "菱铁矿", hemimorphite: "异极矿",
  smithsonite: "菱锌矿", celestine: "天青石", celestite: "天青石", barite: "重晶石", baryte: "重晶石",
  dolomite: "白云石", gypsum: "石膏", selenite: "透石膏", aragonite: "文石", magnetite: "磁铁矿",
  chalcopyrite: "黄铜矿", rutile: "金红石", anatase: "锐钛矿", brookite: "板钛矿", topaz: "托帕石",
  kunzite: "紫锂辉石", spodumene: "锂辉石", petalite: "透锂长石", microcline: "微斜长石", orthoclase: "正长石",
  albite: "钠长石", feldspar: "长石", adularia: "冰长石", goethite: "针铁矿", cerussite: "白铅矿",
  anglesite: "硫酸铅矿", wulfenite: "钼铅矿", mimetite: "砷铅矿", vanadinite: "钒铅矿", descloizite: "钒铅锌矿",
  agate: "玛瑙", chalcedony: "玉髓", opal: "蛋白石", danburite: "赛黄晶", axinite: "斧石", scapolite: "方柱石",
  vesuvianite: "符山石", idocrase: "符山石", diopside: "透辉石", hedenbergite: "钙铁辉石", actinolite: "阳起石",
  tremolite: "透闪石", wollastonite: "硅灰石", wolframite: "黑钨矿", scheelite: "白钨矿", hubnerite: "锰钨矿",
  ferberite: "铁钨矿", marcasite: "白铁矿", arsenopyrite: "毒砂", bornite: "斑铜矿", covellite: "铜蓝",
  enargite: "硫砷铜矿", tetrahedrite: "黝铜矿", proustite: "淡红银矿", pyrargyrite: "深红银矿",
  silver: "自然银", copper: "自然铜", gold: "自然金", sulfur: "自然硫", zircon: "锆石", titanite: "榍石",
  sphene: "榍石", monazite: "独居石", xenotime: "磷钇矿", variscite: "磷铝石", prehnite: "葡萄石",
  apophyllite: "鱼眼石", stilbite: "辉沸石", heulandite: "片沸石", chabazite: "菱沸石", natrolite: "钠沸石",
  mesolite: "中沸石", scolecite: "钙沸石", thomsonite: "杆沸石", pectolite: "针钠钙石", datolite: "硅钙硼石",
  ilvaite: "黑柱石", aegirine: "霓石", crocoite: "铬铅矿", charoite: "查罗石", labradorite: "拉长石",
  amazonite: "天河石", andalusite: "红柱石", chiastolite: "空晶石", kyanite: "蓝晶石", staurolite: "十字石",
  garnet: "石榴石", almandine: "铁铝榴石", spessartine: "锰铝榴石", grossular: "钙铝榴石", uvarovite: "钙铬榴石",
  andradite: "钙铁榴石", demantoid: "翠榴石", tsavorite: "沙弗莱", pyrope: "镁铝榴石", phenakite: "硅铍石",
};

const LOCALITY_ZH = {
  yaogangxian: "湖南瑶岗仙", hunan: "湖南", guizhou: "贵州", yunnan: "云南", sichuan: "四川", guangxi: "广西",
  pakistan: "巴基斯坦", afghanistan: "阿富汗", peru: "秘鲁", spain: "西班牙", bolivia: "玻利维亚",
  brazil: "巴西", mexico: "墨西哥", namibia: "纳米比亚", morocco: "摩洛哥", russia: "俄罗斯",
  japan: "日本", romania: "罗马尼亚", england: "英国", cornwall: "英国康沃尔", cumbria: "英国坎布里亚",
  scotland: "苏格兰", wales: "威尔士", arizona: "美国亚利桑那", colorado: "美国科罗拉多",
  idaho: "美国爱达荷", nevada: "美国内华达", california: "美国加利福尼亚", arkansas: "美国阿肯色", utah: "美国犹他",
  maine: "美国缅因", tennessee: "美国田纳西", france: "法国", italy: "意大利", germany: "德国",
  switzerland: "瑞士", austria: "奥地利", norway: "挪威", sweden: "瑞典", greece: "希腊", turkey: "土耳其",
  iran: "伊朗", india: "印度", myanmar: "缅甸", burma: "缅甸", thailand: "泰国", vietnam: "越南",
  indonesia: "印度尼西亚", australia: "澳大利亚", tasmania: "塔斯马尼亚", madagascar: "马达加斯加",
  tanzania: "坦桑尼亚", kenya: "肯尼亚", nigeria: "尼日利亚", congo: "刚果", zambia: "赞比亚",
  "south africa": "南非", zimbabwe: "津巴布韦", canada: "加拿大", quebec: "加拿大魁北克", ontario: "加拿大安大略",
  chile: "智利", argentina: "阿根廷", colombia: "哥伦比亚", mongolia: "蒙古", kazakhstan: "哈萨克斯坦",
  portugal: "葡萄牙", poland: "波兰", china: "中国", innermongolia: "内蒙古", chifeng: "内蒙古赤峰",
  shangbao: "湖南上堡", xianghualing: "湖南香花岭", linwu: "湖南临武", chenzhou: "湖南郴州",
  qinglong: "贵州晴隆", gejiu: "云南个旧", xikuangshan: "湖南锡矿山", daye: "湖北大冶", pingwu: "四川平武",
  "new mexico": "美国新墨西哥", "north carolina": "美国北卡", virginia: "美国弗吉尼亚", derbyshire: "英国德比郡",
};

function speciesZh(title) {
  const t = title.toLowerCase();
  let best = null;
  let bestIdx = Infinity;
  for (const [en, zh] of Object.entries(MINERAL_ZH)) {
    const idx = t.indexOf(en);
    if (idx !== -1 && idx < bestIdx) {
      bestIdx = idx;
      best = zh;
    }
  }
  return best;
}

function coMinerals(title, primary) {
  const t = title.toLowerCase();
  const set = new Set();
  for (const [en, zh] of Object.entries(MINERAL_ZH)) if (t.includes(en) && zh !== primary) set.add(zh);
  return [...set].slice(0, 3);
}

function localityZh(text) {
  const t = text.toLowerCase().replace(/[\s,]+/g, "");
  let best = null;
  let bestIdx = Infinity;
  for (const [en, zh] of Object.entries(LOCALITY_ZH)) {
    const idx = t.indexOf(en.replace(/[\s,]+/g, ""));
    if (idx !== -1 && idx < bestIdx) {
      bestIdx = idx;
      best = zh;
    }
  }
  return best || "";
}

function parseSizeCm(text) {
  const cm = text.match(/(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)?\s*cm/i);
  if (cm) return parseFloat(cm[1]);
  const cm2 = text.match(/(\d+(?:\.\d+)?)\s*cm/i);
  if (cm2) return parseFloat(cm2[1]);
  const inch = text.match(/(\d+(?:\.\d+)?)\s*(?:in\b|inch|")/i);
  if (inch) return Math.round(parseFloat(inch[1]) * 2.54 * 10) / 10;
  return 0;
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function toRecord({ title, localityText, sizeText, priceCNY, currency, original, url, channel }) {
  const zh = speciesZh(title);
  const primary = zh || title.split(/[,()·:]/)[0].trim().slice(0, 24);
  const loc = localityZh(`${title} ${localityText || ""}`);
  return {
    id: `live-${hash(title + priceCNY)}`,
    species: primary,
    mapped: Boolean(zh),
    coMinerals: zh ? coMinerals(title, zh) : [],
    locality: loc || "产地待解析",
    sizeCm: parseSizeCm(sizeText || title),
    priceCNY,
    status: "list",
    channel,
    note: `${original} · ${currency}`,
    date: TODAY,
    url,
    title: title.slice(0, 160),
    live: true,
  };
}

async function fetchPage(url, asJson = false) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en" },
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return asJson ? res.json() : res.text();
}

async function crawlIRocks() {
  const items = [];
  let sitemap = "";
  try {
    sitemap = await fetchPage("https://www.irocks.com/sitemap.xml");
  } catch (e) {
    return { items, note: `sitemap 失败: ${e.message}` };
  }
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const galleries = [
    ...new Set(
      urls.filter((u) => u.includes("/galleries/themed/") && /gallery-[a-z]+$/.test(u) && /fluorite|beryl|quartz|tourmaline|calcite|pyrite|garnet|apatite|sphalerite|pyromorphite|cassiterite|topaz|gold|silver|copper|rhodochrosite|barite|celestin|dioptase|azurite|malachite|wulfenite|vanadinite/i.test(u))
    ),
  ].slice(0, 8);
  for (const g of galleries) {
    try {
      const html = await fetchPage(g);
      const $ = cheerio.load(html);
      $("dd.price, .price").each((_, el) => {
        const $p = $(el);
        const priceText = $p.text().trim();
        const m = priceText.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);
        if (!m) return;
        const cny = Math.round(parseFloat(m[1].replace(/,/g, "")) * FX.USD);
        if (cny < 36 || cny > 1440000) return;
        const container = $p.closest("dl").length ? $p.closest("dl") : $p.parent().parent();
        const nameEl = container.find("dt, h1, h2, h3, h4, a").first();
        const name = (nameEl.text() || container.find("a").first().attr("title") || "").replace(/\s+/g, " ").trim();
        if (name.length < 5) return;
        const locText = container.text().replace(/\s+/g, " ").trim().slice(0, 400);
        const sizeText = container.find("dd.size").filter((_, s) => /cm/i.test($(s).text())).first().text().trim();
        const href = container.find("a").first().attr("href");
        const url = href ? new URL(href, g).href : g;
        items.push(toRecord({ title: name, localityText: locText, sizeText, priceCNY: cny, currency: "USD", original: `$${m[1]}`, url, channel: "iRocks (Arkenstone)" }));
      });
    } catch {}
  }
  return { items, note: `${galleries.length} 个画廊页` };
}

async function crawlKhyber() {
  const items = [];
  let collectionUrls = [];
  try {
    const html = await fetchPage("https://www.khyberminerals.com/");
    collectionUrls = [...new Set([...html.matchAll(/href="(\/collections\/\d+\/?)"/g)].map((m) => `https://www.khyberminerals.com${m[1]}`))].slice(0, 8);
  } catch (e) {
    return { items, note: `入口失败: ${e.message}` };
  }
  for (const cu of collectionUrls) {
    try {
      const html = await fetchPage(cu);
      const $ = cheerio.load(html);
      const blocks = $("div.resulttitle").toArray();
      let pending = [];
      for (const b of blocks) {
        const t = $(b).text().replace(/\s+/g, " ").trim();
        const pm = t.match(/^\$\s?([\d,]+(?:\.\d{1,2})?)$/);
        if (pm) {
          const name = pending.find((x) => /[a-zA-Z]{4}/.test(x) && !/cm/i.test(x));
          const size = pending.find((x) => /cm/i.test(x));
          if (name) {
            const cny = Math.round(parseFloat(pm[1].replace(/,/g, "")) * FX.USD);
            const locText = pending.filter((x) => x !== name && x !== size).join(" ");
            items.push(toRecord({ title: name, localityText: locText || name, sizeText: size || "", priceCNY: cny, currency: "USD", original: `$${pm[1]}`, url: cu, channel: "Khyber Minerals" }));
          }
          pending = [];
        } else if (t.length > 3) {
          pending.push(t);
          if (pending.length > 4) pending.shift();
        }
      }
    } catch {}
  }
  return { items, note: `${collectionUrls.length} 个合集页` };
}

async function crawlCrystalClassics() {
  const items = [];
  let pages = 0;
  for (let page = 1; page <= 2; page++) {
    try {
      const j = await fetchPage(`https://crystalclassics.co.uk/products.json?limit=250&page=${page}`, true);
      if (!j.products?.length) break;
      pages++;
      for (const p of j.products) {
        const v = p.variants?.[0];
        if (!v?.price) continue;
        const gbp = parseFloat(v.price);
        const cny = Math.round(gbp * FX.GBP);
        if (cny < 36 || cny > 1440000) continue;
        if (/sold out|gift|voucher|card/i.test(p.title)) continue;
        const bodyText = String(p.body_html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400);
        items.push(
          toRecord({
            title: p.title,
            localityText: bodyText,
            sizeText: p.title,
            priceCNY: cny,
            currency: "GBP",
            original: `£${v.price}`,
            url: `https://crystalclassics.co.uk/products/${p.handle}`,
            channel: "Crystal Classics",
          })
        );
      }
    } catch {
      break;
    }
  }
  return { items, note: `products.json ${pages} 页` };
}

const SOURCES = [
  { name: "iRocks (Arkenstone)" },
  { name: "Khyber Minerals" },
  { name: "Crystal Classics" },
];

async function main() {
  console.log("矿标雷达 · 真实数据抓取 v0.3（源定制解析）");
  console.log("=".repeat(60));
  const crawlerMap = { "iRocks (Arkenstone)": crawlIRocks, "Khyber Minerals": crawlKhyber, "Crystal Classics": crawlCrystalClassics };
  let activeSources = SOURCES;
  let rotateNote = "";
  if (process.env.MR_ROTATE) {
    const idxPath = fileURLToPath(new URL("./.rotate-idx", import.meta.url));
    let idx = 0;
    try {
      idx = parseInt(readFileSync(idxPath, "utf8"), 10) || 0;
    } catch {}
    activeSources = [SOURCES[idx % SOURCES.length]];
    writeFileSync(idxPath, String((idx + 1) % SOURCES.length));
    rotateNote = `轮换模式: 本次仅抓 ${activeSources[0].name}（单源约 90 分钟一次）`;
    console.log(rotateNote);
  }
  const crawlers = activeSources.map((s) => [s.name, crawlerMap[s.name]]);
  const all = [];
  const report = [];
  for (const [name, fn] of crawlers) {
    const { items, note } = await fn();
    const dedup = [];
    const seen = new Set();
    for (const it of items) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      dedup.push(it);
    }
    all.push(...dedup);
    report.push({ source: name, count: dedup.length, mapped: dedup.filter((r) => r.mapped).length, note });
    console.log(`${dedup.length ? "OK " : "WARN"} ${name.padEnd(24)} ${dedup.length} 条 (矿种映射 ${dedup.filter((r) => r.mapped).length}) · ${note}`);
  }

  if (process.env.MR_ROTATE) {
    const dirNow = fileURLToPath(new URL("../data/live", import.meta.url));
    try {
      const prev = JSON.parse(readFileSync(`${dirNow}/prices.json`, "utf8"));
      const activeNames = new Set(activeSources.map((s) => s.name));
      const keep = prev.filter((r) => !activeNames.has(r.channel));
      all.push(...keep);
      report.push(...[]);
      console.log(`轮换合并: 保留未轮到源的 ${keep.length} 条既有记录`);
    } catch {}
  }

  const feed = all
    .filter((r) => r.mapped)
    .sort((a, b) => b.priceCNY - a.priceCNY)
    .slice(0, 20)
    .map((r, i) => ({
      id: `lf-${i}`,
      platform: "官网",
      source: r.channel,
      title: `${r.title.slice(0, 88)} · 标价 ${r.note.split(" ·")[0]}`,
      engagement: "自动抓取",
      priceTag: { label: `已提取标价 ¥${r.priceCNY.toLocaleString("zh-CN")}`, kind: "extracted" },
      url: r.url,
      hoursAgo: 1,
      live: true,
    }));

  const dir = fileURLToPath(new URL("../data/live", import.meta.url));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/prices.json`, JSON.stringify(all, null, 2));
  writeFileSync(`${dir}/feed.json`, JSON.stringify(feed, null, 2));
  writeFileSync(`${dir}/meta.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), total: all.length, report }, null, 2));
  console.log("=".repeat(60));
  console.log(`共 ${all.length} 条真实价格记录 → data/live/prices.json`);
}

main().catch((e) => {
  console.error("抓取失败:", e.message);
  process.exit(1);
});
