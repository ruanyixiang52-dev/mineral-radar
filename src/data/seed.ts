export type PriceStatus = "list" | "quote" | "deal";

export interface PriceRecord {
  id: string;
  species: string;
  locality: string;
  sizeCm: number;
  priceCNY: number;
  status: PriceStatus;
  channel: string;
  note?: string;
  date: string;
}

export type Platform = "官网" | "抖音" | "B站" | "微博" | "小红书" | "贴吧" | "公众号" | "拍卖";

export interface FeedItem {
  id: string;
  platform: Platform;
  source: string;
  title: string;
  engagement: string;
  priceTag?: { label: string; kind: "extracted" | "pending" | "deal" };
  url?: string;
  hoursAgo: number;
}

export interface Species {
  slug: string;
  name: string;
  en: string;
  chemistry: string;
  crystalSystem: string;
  localities: string[];
  desc: string;
}

export const speciesList: Species[] = [
  {
    slug: "fluorite",
    name: "萤石",
    en: "Fluorite",
    chemistry: "CaF₂",
    crystalSystem: "等轴晶系",
    localities: ["贵州晴隆", "湖南香花岭", "江西德安", "英国蓝约翰", "西班牙"],
    desc: "收藏圈第一大矿种，颜色丰富（紫/绿/蓝/多彩），中国产萤石在国际市场认可度高。晴隆蓝紫色萤石近三年涨幅显著。",
  },
  {
    slug: "aquamarine",
    name: "海蓝宝",
    en: "Aquamarine",
    chemistry: "Be₃Al₂Si₆O₁₈",
    crystalSystem: "三方晶系",
    localities: ["巴基斯坦希格尔", "巴西米纳斯吉拉斯", "云南贡山"],
    desc: "绿柱石族名品，巴基斯坦产晶体透亮完整，2025 年以来原料价持续上行，是市场热度最高的品种之一。",
  },
  {
    slug: "pyrite",
    name: "黄铁矿",
    en: "Pyrite",
    chemistry: "FeS₂",
    crystalSystem: "等轴晶系",
    localities: ["西班牙纳瓦什", "秘鲁", "湖南上堡"],
    desc: "「愚人金」，西班牙完美立方晶形是经典藏品，价格亲民，是入门收藏首选矿种之一。",
  },
  {
    slug: "calcite",
    name: "方解石",
    en: "Calcite",
    chemistry: "CaCO₃",
    crystalSystem: "三方晶系",
    localities: ["湖南香花岭", "湖北大冶", "墨西哥", "冰岛"],
    desc: "晶形变化最多的矿物之一，与萤石/水晶共生的湖南标本市场流通量大。",
  },
  {
    slug: "amethyst",
    name: "紫水晶",
    en: "Amethyst",
    chemistry: "SiO₂",
    crystalSystem: "三方晶系",
    localities: ["乌拉圭", "巴西", "江苏东海"],
    desc: "入门级人气矿种，乌拉圭深紫色晶簇价格坚挺，巴西大件产量稳定价格平稳。",
  },
  {
    slug: "pyromorphite",
    name: "磷氯铅矿",
    en: "Pyromorphite",
    chemistry: "Pb₅(PO₄)₃Cl",
    crystalSystem: "六方晶系",
    localities: ["广西恭城", "西班牙", "美国爱达荷"],
    desc: "广西恭城绿色磷氯铅矿是国际市场的中国名片，近一年涨幅居各矿种前列。",
  },
  {
    slug: "cassiterite",
    name: "锡石",
    en: "Cassiterite",
    chemistry: "SnO₂",
    crystalSystem: "四方晶系",
    localities: ["云南个旧", "四川", "玻利维亚"],
    desc: "「大锡矿」个旧锡石双晶是矿标展会的明星品种，顶级标本以六位数成交。",
  },
  {
    slug: "stibnite",
    name: "辉锑矿",
    en: "Stibnite",
    chemistry: "Sb₂S₃",
    crystalSystem: "斜方晶系",
    localities: ["湖南锡矿山", "日本", "罗马尼亚"],
    desc: "金属光泽强烈的剑状晶体，锡矿山产大晶体是国际收藏家追逐的对象。",
  },
];

export const priceRecords: PriceRecord[] = [
  { id: "p01", species: "萤石", locality: "贵州晴隆", sizeCm: 6.2, priceCNY: 4500, status: "list", channel: "淘宝矿晶店", date: "2026-08-15" },
  { id: "p02", species: "萤石", locality: "贵州晴隆", sizeCm: 6.2, priceCNY: 3800, status: "quote", channel: "抖音直播", date: "2026-08-16" },
  { id: "p03", species: "萤石", locality: "贵州晴隆", sizeCm: 6.0, priceCNY: 3100, status: "deal", channel: "闲鱼", date: "2026-08-12" },
  { id: "p04", species: "萤石", locality: "贵州晴隆", sizeCm: 7.5, priceCNY: 5200, status: "deal", channel: "微拍堂", note: "27次出价", date: "2026-08-14" },
  { id: "p05", species: "萤石", locality: "贵州晴隆", sizeCm: 5.8, priceCNY: 2650, status: "deal", channel: "微拍堂", date: "2026-08-09" },
  { id: "p06", species: "萤石", locality: "湖南香花岭", sizeCm: 8.5, priceCNY: 2800, status: "list", channel: "淘宝矿晶店", date: "2026-08-15" },
  { id: "p07", species: "萤石", locality: "湖南香花岭", sizeCm: 8.5, priceCNY: 1680, status: "deal", channel: "微拍堂", note: "共生方解石", date: "2026-08-16" },
  { id: "p08", species: "萤石", locality: "湖南香花岭", sizeCm: 8.0, priceCNY: 2300, status: "quote", channel: "小红书", date: "2026-08-13" },
  { id: "p09", species: "萤石", locality: "西班牙", sizeCm: 12, priceCNY: 3240, status: "list", channel: "Fabre Minerals", note: "标价 $450", date: "2026-08-10" },
  { id: "p10", species: "萤石", locality: "西班牙", sizeCm: 11.5, priceCNY: 4900, status: "list", channel: "国内经销商", date: "2026-08-11" },
  { id: "p11", species: "海蓝宝", locality: "巴基斯坦希格尔", sizeCm: 9, priceCNY: 12800, status: "list", channel: "iRocks", note: "标价 $1,780", date: "2026-08-08" },
  { id: "p12", species: "海蓝宝", locality: "巴基斯坦希格尔", sizeCm: 8.5, priceCNY: 8600, status: "deal", channel: "微拍堂", date: "2026-08-15" },
  { id: "p13", species: "海蓝宝", locality: "巴基斯坦希格尔", sizeCm: 8.0, priceCNY: 9500, status: "quote", channel: "抖音直播", date: "2026-08-16" },
  { id: "p14", species: "海蓝宝", locality: "巴基斯坦希格尔", sizeCm: 7.5, priceCNY: 7200, status: "deal", channel: "闲鱼", date: "2026-08-05" },
  { id: "p15", species: "海蓝宝", locality: "云南贡山", sizeCm: 6.5, priceCNY: 3400, status: "list", channel: "淘宝矿晶店", date: "2026-08-12" },
  { id: "p16", species: "黄铁矿", locality: "西班牙纳瓦什", sizeCm: 5, priceCNY: 680, status: "list", channel: "Arkenstone", note: "标价 $95", date: "2026-08-06" },
  { id: "p17", species: "黄铁矿", locality: "西班牙纳瓦什", sizeCm: 4.5, priceCNY: 420, status: "deal", channel: "闲鱼", date: "2026-08-11" },
  { id: "p18", species: "黄铁矿", locality: "秘鲁", sizeCm: 7, priceCNY: 550, status: "deal", channel: "微拍堂", date: "2026-08-13" },
  { id: "p19", species: "黄铁矿", locality: "湖南上堡", sizeCm: 6, priceCNY: 300, status: "list", channel: "淘宝矿晶店", date: "2026-08-14" },
  { id: "p20", species: "方解石", locality: "湖南香花岭", sizeCm: 10, priceCNY: 950, status: "list", channel: "淘宝矿晶店", date: "2026-08-13" },
  { id: "p21", species: "方解石", locality: "湖南香花岭", sizeCm: 9.5, priceCNY: 620, status: "deal", channel: "微拍堂", date: "2026-08-14" },
  { id: "p22", species: "方解石", locality: "墨西哥", sizeCm: 8, priceCNY: 1180, status: "list", channel: "Etsy", note: "标价 $165", date: "2026-08-07" },
  { id: "p23", species: "紫水晶", locality: "乌拉圭", sizeCm: 15, priceCNY: 1350, status: "list", channel: "淘宝矿晶店", date: "2026-08-12" },
  { id: "p24", species: "紫水晶", locality: "乌拉圭", sizeCm: 14, priceCNY: 890, status: "deal", channel: "闲鱼", date: "2026-08-10" },
  { id: "p25", species: "紫水晶", locality: "巴西", sizeCm: 20, priceCNY: 1600, status: "deal", channel: "微拍堂", date: "2026-08-08" },
  { id: "p26", species: "紫水晶", locality: "巴西", sizeCm: 18, priceCNY: 2100, status: "list", channel: "微店", date: "2026-08-15" },
  { id: "p27", species: "磷氯铅矿", locality: "广西恭城", sizeCm: 4.5, priceCNY: 7800, status: "list", channel: "国内经销商", date: "2026-08-14" },
  { id: "p28", species: "磷氯铅矿", locality: "广西恭城", sizeCm: 4.0, priceCNY: 5600, status: "deal", channel: "微拍堂", note: "18次出价", date: "2026-08-16" },
  { id: "p29", species: "磷氯铅矿", locality: "广西恭城", sizeCm: 3.8, priceCNY: 4800, status: "deal", channel: "闲鱼", date: "2026-08-09" },
  { id: "p30", species: "磷氯铅矿", locality: "西班牙", sizeCm: 5, priceCNY: 5200, status: "list", channel: "Fabre Minerals", note: "标价 $720", date: "2026-08-05" },
  { id: "p31", species: "锡石", locality: "云南个旧", sizeCm: 5.5, priceCNY: 98000, status: "quote", channel: "抖音直播", note: "展会现场开价", date: "2026-08-15" },
  { id: "p32", species: "锡石", locality: "云南个旧", sizeCm: 4.0, priceCNY: 52000, status: "deal", channel: "线下展会", date: "2026-08-02" },
  { id: "p33", species: "锡石", locality: "玻利维亚", sizeCm: 3.5, priceCNY: 21000, status: "list", channel: "eBay", note: "标价 $2,950", date: "2026-08-11" },
  { id: "p34", species: "辉锑矿", locality: "湖南锡矿山", sizeCm: 12, priceCNY: 15000, status: "list", channel: "国内经销商", date: "2026-08-13" },
  { id: "p35", species: "辉锑矿", locality: "湖南锡矿山", sizeCm: 10, priceCNY: 9800, status: "deal", channel: "微拍堂", date: "2026-08-15" },
  { id: "p36", species: "辉锑矿", locality: "日本", sizeCm: 8, priceCNY: 12400, status: "list", channel: "iRocks", note: "标价 $1,730", date: "2026-08-04" },
];

export const feedItems: FeedItem[] = [
  { id: "f01", platform: "拍卖", source: "微拍堂", title: "湖南香花岭萤石·方解石共生 9.8cm 落槌 ¥3,150", engagement: "27 次出价", priceTag: { label: "成交 ¥3,150", kind: "deal" }, hoursAgo: 8 },
  { id: "f02", platform: "官网", source: "Arkenstone 上新", title: "缅甸抹谷红宝石晶体 4.2cm 标价 $8,500", engagement: "本周上新 12 件", priceTag: { label: "已提取标价", kind: "extracted" }, url: "https://www.irocks.com", hoursAgo: 2 },
  { id: "f03", platform: "抖音", source: "矿晶直播", title: "「这块海蓝宝别问，问就是六位数」直播切片热传", engagement: "互动 12.4万", priceTag: { label: "口语报价待核", kind: "pending" }, hoursAgo: 5 },
  { id: "f04", platform: "小红书", source: "收藏笔记", title: "晴隆萤石收藏入门：八边杯三位数就能拿下", engagement: "赞 3,241 · 藏 1,876", priceTag: { label: "提到价格 ¥480", kind: "extracted" }, hoursAgo: 22 },
  { id: "f05", platform: "B站", source: "矿物科普", title: "为什么巴基斯坦海蓝宝今年涨疯了", engagement: "播放 18.7万 · 弹幕 2,304", hoursAgo: 50 },
  { id: "f06", platform: "抖音", source: "展会现场", title: "桂林矿晶展直击：大锡矿开价六位数", engagement: "赞 8,912 · 评 1,203", priceTag: { label: "口语报价待核", kind: "pending" }, hoursAgo: 72 },
  { id: "f07", platform: "官网", source: "Mindat 更新", title: "贵州晴隆新增萤石-方解石共生矿点标本记录 17 条", engagement: "权威数据源", hoursAgo: 96 },
  { id: "f08", platform: "微博", source: "矿晶超话", title: "香花岭新出一批磷氯铅矿，品质近年少见", engagement: "转 214 · 赞 1,102", hoursAgo: 30 },
  { id: "f09", platform: "贴吧", source: "矿晶吧", title: "讨论：现在入西班牙黄铁矿是不是高位接盘", engagement: "回复 342", hoursAgo: 40 },
  { id: "f10", platform: "公众号", source: "矿晶观察", title: "半年报：2026 上半年矿标市场成交复盘", engagement: "阅读 2.1万", hoursAgo: 120 },
];

export const topics = [
  { name: "#桂林矿晶展", heat: 96 },
  { name: "#海蓝宝涨价", heat: 82 },
  { name: "#晴隆萤石", heat: 71 },
  { name: "#磷氯铅矿", heat: 64 },
  { name: "#矿标避坑", heat: 58 },
  { name: "#大锡矿", heat: 44 },
];

export const hotKeywords = ["晴隆萤石", "大锡矿", "抹谷红宝", "车轮矿", "蓝约翰", "香花岭"];
