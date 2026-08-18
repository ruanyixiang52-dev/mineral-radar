# 矿标雷达 MineralRadar

矿物标本行业情报站：价格行情 / 多渠道比价 / 内容雷达 / 品种百科 / 趋势指数 / 全局搜索 / 情报日报 / 半自动录入。

## 访问

- 本地：`npm run build && npm run start` → http://localhost:3210（`npm run dev` 会被本机 safe-delete 保护拦截，用生产模式）
- 云端快照：CloudStudio 部署（`npm run export` 产出 `dist/` 后重新部署）

## 页面（10 个）

| 路由 | 说明 |
|------|------|
| `/` | 首页：指数大卡+走势面积图、4 指标卡、情报流、热度榜 |
| `/compare` | 比价：矿种筛选（客户端即时）、三态价格、合理区间、标价溢价、¥/cm |
| `/radar` | 内容雷达：8 平台筛选，官网+B站为真实抓取 |
| `/wiki` + `/wiki/[slug]` | 品种百科：手工档案 + 自动档案（矿种色环卡片） |
| `/trends` | 趋势：指数走势（SQLite 历史序列）、样本量、中位数 Top、¥/cm 榜 |
| `/search` | 全局搜索：矿种 / 价格记录 / 情报内容 |
| `/daily` | 矿标情报日报 |
| `/sources` | 数据源状态：八类地图、抓取统计、攻坚状态 |
| `/admin` | 手动录入：微拍堂/闲鱼/展会成交 → CSV → npm run sync 入库 |

## 数据流水线

```bash
npm run fetch    # ① 3 个国际源 HTTP 爬虫（iRocks/Khyber/Crystal Classics）→ data/live/*.json
npm run social   # ② B站浏览器抓取（Playwright 引擎）→ data/live/social-feed.json
npm run sync     # ③ 全部入库 SQLite（data/mineral.db）+ 生成历史序列 data/history/series.json
npm run build    # ④ 构建期读取数据 → 全站刷新
npm run probe    # 数据源可达性探测
npm run export   # 静态导出 dist/（部署用）
```

日常更新顺序：`fetch → social → sync → build`（重启服务生效）。

## 数据源现状

| 源 | 方式 | 状态 |
|----|------|------|
| iRocks / Khyber / Crystal Classics | 源定制 HTTP 爬虫 | ✅ ~930 条真实标价/次 |
| B站 | Playwright 浏览器（search 页 order=pubdate） | ✅ 30 条真实热度/次 |
| 微博 | 浏览器 | ⛔ 双端登录墙，需人工登录 profile 后接管 |
| Fabre Minerals | 浏览器 | ⛔ Cloudflare 人机验证，待 CloakBrowser 完整引擎 |
| 微拍堂 / 闲鱼 | 登录墙+风控 | 半自动：`/admin` 录入 → `npm run sync` |
| eBay API / Mindat / 抖音 / 小红书 | — | 计划中 |

## 存储架构

- **SQLite**（`data/mineral.db`）：prices 表（按 id+日期 唯一）+ fetch_runs 抓取日志，历史快照累积驱动趋势图
- **构建期 JSON**：`data/live/`（爬虫产出）、`data/history/series.json`（sync 生成）、`data/manual/import.csv`（手动录入）
- Next.js 不直接读 SQLite（避免原生模块打包问题），sync 脚本负责 DB → JSON

## 技术栈

Next.js 14 (App Router) + Tailwind CSS 3 + better-sqlite3 + cheerio + Playwright（社媒攻坚）
设计系统：紫水晶紫主色 / 涨红跌绿 / 琥珀价格色 / 石墨灰中性阶，统一组件 `src/components/ui.tsx`

## 合规

只抓公开数据；不抓个人信息；控制频率；摘要+来源+跳原文，不整篇搬运。
