# DengManyuan Personal Website

艺术家邓蔓媛个人作品展示网站，基于 Next.js 15 App Router 构建，采用数据驱动的作品管理模式，支持 4 大分类 × 3 年 × 31 件作品的灵活组织，内置多种图像布局模板、云端图片 CDN 容错、响应式移动端适配，以及可扩展的自定义附页布局系统。

---

## 目录

- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [数据驱动架构](#数据驱动架构)
- [模板清单](#模板清单)
- [资源路径约定](#资源路径约定)
- [移动端规范](#移动端规范)
- [稳定性与容错机制](#稳定性与容错机制)
- [启动 / 构建 / 类型检查](#启动--构建--类型检查)
- [维护任务 Checklist](#维护任务-checklist)
- [版本快照（2026-08-28）](#版本快照2026-08-28)

---

## 技术栈

| 层 | 技术 | 版本 / 说明 |
|---|---|---|
| 框架 | Next.js | **15.2.8+**（⚠️ 必须 ≥ 15.2.8，避免 CVE-2025-66478）|
| 渲染模式 | App Router | RSC（默认服务端组件）+ `"use client"`（交互组件：WorkDetail、JustifiedGallery、Centered 等）|
| 视图层 | React | 18 |
| 类型 | TypeScript | 严格模式，每轮修改都通过 `npx tsc --noEmit` 0 输出验证 |
| 样式 | Tailwind CSS | 3；无额外 CSS 文件；字号/边距大量使用 `clamp()` 字面量 |
| 图片存储 | Cloudflare R2 CDN | 前缀：`https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev` |
| 路由 | 动态段 | `/works/[category]/[year]`（分类画廊）+ `/works/[category]/[year]/[slug]`（作品详情）|
| 布局算法 | 自研同行等高 | 基于 `onLoad` natural dims + `ResizeObserver` + 归一化 scale |

---

## 目录结构

```
.
├── app/
│   ├── layout.tsx                 # 全局布局 + <Navigation/>
│   ├── page.tsx                   # 首页
│   ├── about/page.tsx             # About 页
│   ├── researches/page.tsx        # Research 页
│   ├── news/page.tsx              # News 页
│   ├── works/
│   │   ├── page.tsx               # WORKS 顶层：4 分类卡片（CategoryGallery）
│   │   └── [category]/[year]/
│   │       ├── page.tsx           # WORKS/Paintings/2024 等分类画廊（JustifiedGallery）
│   │       └── [slug]/page.tsx    # 作品详情页（WorkDetail）
│   └── globals.css                # 全局样式 + Tailwind 指令
├── components/
│   ├── navigation.tsx             # 全局导航
│   ├── justified-gallery.tsx      # 分类画廊（同行等高校准 + fallbackSrc 容错）
│   ├── category-gallery.tsx       # WORKS 顶层 4 分类卡（clamp 字号边距自适应）
│   └── work-detail.tsx            # 作品详情：5 主页模板 + 9+1 附页模板 + SafeImg + wrapHeroImgWithLink
├── lib/
│   ├── works-data.ts              # 【单一数据源】Work 类型 + 31 件作品数据
│   └── gallery-config.ts          # GAP = 24（全局间距常量）等
├── scripts/
│   └── recover-images.mjs         # 图片恢复 / 迁移辅助脚本
├── WORK_LAYOUT_TEMPLATES.md       # 作品主页 5 模板完整文档
├── SUBPAGE_TEMPLATES.md           # 作品附页 9+1 模板完整文档
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md                      # ← 本文件
```

---

## 数据驱动架构

**单源真值**：`lib/works-data.ts`，所有页面、画廊、模板全部只读这里的数据，不存在分散的硬编码。

### 数据组织层级

```
workCategories: WorkCategory[]
  │
  ├── name: "Paintings" / "Installations" / "Workshops" / "Photograph & Videos"
  ├── slug: "paintings" / "installations" / "workshops" / "photograph-and-videos"
  └── years: YearGroup[]
       │
       ├── year: "2024" / "2025" / "2026"
       └── works: Work[]               ← 按年份组织 31 件作品
            │
            ├── slug / title / materials / description
            ├── thumbnail              ← 作品详情页主图（缩略图用）
            ├── aspectRatio            ← thumbnail 的真实宽/高比
            ├── cover                  ← 分类画廊专用缩略图（covers/ 目录）
            ├── coverAspectRatio       ← cover 的宽/高比（可选）
            ├── images[]               ← 主页多图场景（同行等高）
            ├── layout                 ← 主页模板名（字面量联合）
            ├── imgWidthRatio          ← HeroImageLayout partial/wide 的 75%/100%
            ├── gridColumns            ← GridLayout 列数（默认 3）
            ├── heroLink               ← 主图点击跳转 URL（优先于 work.link）
            ├── heroCaption            ← 主图下方说明文案
            ├── link                   ← 作品外部链接（heroLink 未设置时，主图也用这个）
            └── subPages: SubPage[]    ← 作品附页数组，每件作品可 0~N 个附页
                 ├── layout            ← 附页模板名（含自定义 becomingHumanCollage5）
                 ├── images[]          ← 附页图像源，每图可选 caption
                 ├── splitRatio / topRightCount / leftBottomCount 等模板专用字段
```

### 修改一次，全站生效

- 改作品缩略图 → 只改 `Work.thumbnail` / `aspectRatio`
- 改分类画廊封面 → 只改 `Work.cover` / `coverAspectRatio`
- 改主图跳转链接 → 只改 `Work.heroLink`
- 改主页布局 → 只改 `Work.layout`
- 加新附页 → 只 `push` 一条 `SubPage`

---

## 模板清单

详细文档见：

- 作品主页（5 统一模板） → [WORK_LAYOUT_TEMPLATES.md](./WORK_LAYOUT_TEMPLATES.md)
- 作品附页（9 通用 + 1 定制） → [SUBPAGE_TEMPLATES.md](./SUBPAGE_TEMPLATES.md)

### 主页模板（5）

| 内部 layout 字面量 | 对应实现类 | 典型场景 | 代码位置 |
|---|---|---|---|
| `"left"` / `"right"` | SideBySideLayout | 主图 + 文案左右分栏 | work-detail.tsx `SideBySideLayout` |
| `"center"` | CenteredLayout | 单图居中 + 标题/说明下方 | work-detail.tsx `CenteredLayout` |
| `"wide"` / `"partial"` / `"bottom"` / `"wideBottom"` | HeroImageLayout + HeroImageBottomLayout | 主图占据视觉主体；partial=75%，wide=100% | work-detail.tsx `HeroImageRow` |
| `"grid"` | GridLayout | N 张图网格排列，caption 固定在每格下方 | work-detail.tsx `GridLayout` |
|（多图同 wide）| HeroImageMultiRow | 若干张图一行等高（Becoming Human 主图 3 张）| work-detail.tsx `HeroImageMultiRow` |

### 附页模板（9 通用 + 1 定制）

| layout 字面量 | 布局说明 | 适用件数 |
|---|---|---|
| `"multiRow"` | 多行，每行 1~N 张，同行等高 | 任意 |
| `"single"` | 单张全宽 | 1 |
| `"row"` | 一行 N 张同行等高 | 任意 |
| `"grid"` | 网格（同主页 GridLayout，附页版）| 任意 |
| `"stackedRight"` | 左大图 + 右堆叠小图 | ≥2 |
| `"textLeftStackedRight"` | 左文案 + 右堆叠图 | 任意 |
| `"leftMainRightStacked"` | 左大图 + 右上大 + 右下 N 张同行等高 | ≥3 |
| `"sevenSplit"` | 2×2 棋盘：左上 1 + 右上 N 同行 + 左下 M 同行 + 右下 1，`splitRatio` 可调 | N+M+2 ≥4 |
| `"fiveImageStack"` | 5 张纵向堆叠 + 每张右侧 caption | 5 |
| `"becomingHumanCollage5"` | **定制**：Row1 2 张等高 + Row2 3 张等高 | 5 |

---

## 资源路径约定

所有图片走 **Cloudflare R2 CDN**，前缀统一：

```
https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev/images/
```

### 三层图片体系

| 用途 | CDN 路径 | works-data.ts 字段 |
|---|---|---|
| WORKS 顶层 4 分类卡面 | `images/works/{paintings,installations,workshops,photograph_and_videos}.jpg` | category-gallery.tsx 常量 |
| 分类画廊封面（缩略图） | `images/{category}-{YYYY}/covers/{slug}.{jpg,png}` | `Work.cover` |
| 作品主图 / 作品详情页缩略图 | `images/{category}-{YYYY}/{slug}/main-1.{jpg,png}` | `Work.thumbnail` |
| 作品附页图片 | `images/{category}-{YYYY}/{slug}/part-{N}.{jpg,png}` | `SubPage.images[i].src` |

### 命名规范

- **文件全小写 kebab-case**，禁止中文 / Unicode 特殊字符；统一 `.jpg` 或 `.png`。
- 目录名 `{category}-{YYYY}`：`paintings-2024` / `installations-2025` / `workshops-2026` / `photograph-and-videos-2026`
- 作品 slug 与目录名一致：`sacred-sapling` → `paintings-2024/sacred-sapling/main-1.jpg`
- 罗马数字：若用作 caption，**用真实 Unicode 字符** ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ（不是 `I / II / III` 英文字母）。

---

## 移动端规范

- **响应式断点**：`768px`（md）
  - ≥ 768px：维持原复杂布局（左右分栏 / 同行等高 / 棋盘）
  - < 768px：全部降级为**垂直堆叠**（图文上下排序，图在上、文在下；多图每行 1 张）
- **全局间距常量**：`GAP = 24`（定义在 `lib/gallery-config.ts`；CSS `gap` 在部分 flex 场景下不可靠，统一用 `marginLeft`/`marginTop` + GAP 常量）
- **caption 样式**（图像下文字 / 图像上悬浮说明）：
  - 文字大小 10px / 浅灰 / opacity 0.5 / 居中 / `marginTop: 8px`
  - 内容中 `|` 或 `\n` 都视为换行（`renderCaptionText` 按 `/\||\n/` 切行）
- **分类画廊字号**：桌面端 `clamp(14px, row.height × 13.5%, 48px)`，移动端 `clamp(1.1rem, 4.5vw, 2.25rem)`
- **可点击跳转图像**：双端共享 hover 灰色蒙版 + 中央「Click to redirect to {URL}」，200ms 淡入淡出（`group`/`pointer-events:none overlay`）

---

## 稳定性与容错机制

### 1. SafeImg — 作品详情页全局三级容错

位置：[`components/work-detail.tsx SafeImg`](./components/work-detail.tsx)（forwardRef，兼容所有 `<img>` 属性）

| 阶段 | 触发条件 | 回退源 |
|---|---|---|
| Stage 0 | 默认 | 原始 `src`（R2 CDN）|
| Stage 1 | onError（404 / 连接关闭 / ORB）| `FallbackThumbnailCtx` → `work.thumbnail`（作品 main-1.*）|
| Stage 2 | Stage 1 也报错 | 内置 data-URI SVG 占位图（灰底 + 作品 slug 文字，保证布局不塌陷）|

作品详情页**所有 `<img>`**（主页 + 附页）都替换为 `<SafeImg>`，共 31 处覆盖。

### 2. JustifiedGallery — 分类画廊二级容错

位置：[`components/justified-gallery.tsx`](./components/justified-gallery.tsx)

- `GalleryItem.fallbackSrc` 新增字段：如果 `cover` 挂了（R2 Content-Type 被错误设为 `application/octet-stream` → 浏览器 ORB 拦截），`onError` 自动切到 `thumbnail`。
- 防重复触发：用 `Set<number>` 记录已 error 的 index，避免 onError 循环。

### 3. 同行等高校准（onLoad 真实尺寸 + 归一化 scale）

分类画廊 / WORKS 顶层 / HeroImageMultiRow / sevenSplit / becomingHumanCollage5 都使用同一算法：

```
1. 每图 onLoad 读取 naturalWidth / naturalHeight → 真实 r_k
2. 可用宽度 avail = containerWidth - (n-1) × GAP
3. H = avail / Σ(r_k)          ← 同一行目标等高
4. W_k = r_k × H
5. 若 ΣW_k 与 avail 有浮点误差 → scale = avail / ΣW_k 归一化
6. 最终：img.style.width  = `${W_k * scale}px`
         img.style.height = `${H * scale}px`
```

确保**行内容真正等高**（不是 `img` 元素等高 + object-contain 留白），也杜绝横向滚动条。

### 4. heroLink 优先链

```
主图跳转 URL = work.heroLink ?? work.link
```

- `heroLink` 留空则退化为 `link`；二者都空 → 不生成 `<a>`。
- 一旦生成 `<a>`，hover 自动出灰色蒙版 + 跳转说明（`wrapHeroImgWithLink` 统一封装）。

### 5. R2 CDN 元数据异常（ORB）兜底

典型错误：`net::ERR_BLOCKED_BY_ORB`（原因：R2 对象 Content-Type 被上传工具误写为 `application/octet-stream`，浏览器把图片当二进制拦截）

- **不修改 R2**，通过上面 1 + 2 两层 onError 容错降级；如果需要根治，用 R2 Console / S3 API 修正 Content-Type 到 `image/png` / `image/jpeg`。

---

## 启动 / 构建 / 类型检查

```bash
# 1. 安装依赖
npm install

# 2. 本地开发（默认 http://localhost:3000）
npm run dev

# 3. 生产构建
npm run build

# 4. 运行产物
npm start

# 5. 类型检查（任何合并前必跑，要求 0 输出）
npx tsc --noEmit
```

---

## 维护任务 Checklist

### ➕ 新增一件作品

1. **上传图片到 R2**：
   - 作品主图 → `{category}-{YYYY}/{slug}/main-1.jpg`
   - 分类画廊封面 → `{category}-{YYYY}/covers/{slug}.jpg`
   - 附页 → `{category}-{YYYY}/{slug}/part-1.jpg`, `part-2.jpg`…
2. 编辑 [`lib/works-data.ts`](./lib/works-data.ts)，在对应 `year.works[]` 里 push 一条 `Work`：
   - 必填：`slug` / `title` / `thumbnail` / `aspectRatio` / `cover` / `coverAspectRatio` / `layout`
   - 选填：`heroLink` / `heroCaption` / `link` / `gridColumns` / `images[]` / `subPages[]`
3. 跑 `npx tsc --noEmit`，0 输出即 OK。

### 🔁 更换作品分类封面

只改 `Work.cover`（必要时同步 `coverAspectRatio`）。JustifiedGallery 会自动用它，挂了自动退回 thumbnail。

### 📅 新增一个年份

1. 在对应 `WorkCategory.years[]` 里新增一条 `YearGroup { year: "2027", works: [] }`。
2. R2 里新建目录 `{category}-2027/` + `{category}-2027/covers/`。
3. 按「新增作品」流程往里 push。
4. WORKS 顶层卡片 / 年份自动同步（渲染由 `workCategories` 驱动）。

### 🎨 新增自定义附页布局（例如 becomingHumanCollage6）

1. 在 [`lib/works-data.ts`](./lib/works-data.ts) 的 `SubPage.layout` 字面量联合里追加 `"becomingHumanCollage6"`。
2. 在 [`components/work-detail.tsx`](./components/work-detail.tsx) 内新增一个组件函数（可直接拷 `BecomingHumanCollage5SubPage` 改）。
3. 在 `SubPageLayout` 首位 if 拦截里加 case：`if (subPage.layout === "becomingHumanCollage6") return <Collage6…/>`。
4. 在作品 `subPages[]` 中引用该 layout，填 images 数组。
5. `npx tsc --noEmit` → 0 输出。

### 🔢 重新启用标题罗马数字前缀（默认已关闭）

在 [`components/work-detail.tsx`](./components/work-detail.tsx) 搜索 `const numStr = ""`，恢复为：

```tsx
const numStr = `${toRoman(index + 1)}. `;
```

即可重新在作品详情标题前显示 Ⅰ. Ⅱ. Ⅲ. …

### 🧭 WORKS 顶层新增 / 删除分类

编辑 `workCategories` 数组：新增一条 `WorkCategory`（含对应 `years: []`）即可，导航、画廊、路由自动共享。

---

## 版本快照（2026-08-28）

### 数据覆盖率 100%

| 分类 | 年份 | 作品数 | thumbnail | cover |
|---|---|---|---|---|
| Paintings | 2024 | 6 | ✅ 全部 | ✅ 全部 |
| Paintings | 2025 | 9 | ✅ 全部 | ✅ 全部 |
| Paintings | 2026 | 5 | ✅ 全部 | ✅ 全部 |
| Installations | 2025 | 4 | ✅ 全部 | ✅ 全部 |
| Installations | 2026 | 3 | ✅ 全部 | ✅ 全部 |
| Workshops | 2025 | 1 | ✅ 全部 | ✅ 全部 |
| Workshops | 2026 | 1 | ✅ 全部 | ✅ 全部 |
| Photograph & Videos | 2026 | 3 | ✅ 全部 | ✅ 全部 |
| **合计** | | **31** | **31 / 31** | **31 / 31** |

### 本轮完成功能清单（2026-08-28 会话）

- ✅ WORKS 顶层 4 分类卡片切换到 `/images/works/*.jpg`
- ✅ 所有作品 thumbnail 迁移到 `{slug}/main-1.*` 统一目录
- ✅ 引入 `cover` 字段 + `covers/` 目录，分类画廊全作品 100% 有封面
- ✅ JustifiedGallery 同行**内容**等高校准（像素尺寸 + onLoad dims + 归一化 scale）
- ✅ WORKS 顶层分类标题字号 / 边距 `clamp()` 自适应（桌面随 row.height，移动端随 vw）
- ✅ Weishan Memory Collage Workshop：HeroImageLayout partial（75% 居中）+ heroLink YouTube + heroCaption
- ✅ Tree Spirit Ⅰ Ⅱ Ⅲ：主页从 3 张同行 → 单图 wide
- ✅ The Mountain of Spirits：填材料（Gouache on paper \| 70 × 45 cm \| 2026）+ 描述
- ✅ 作品详情标题默认去罗马数字前缀（`numStr = ""`）
- ✅ 全作品详情 `<img>` → `<SafeImg>` 三级容错（原图 → thumbnail → SVG）
- ✅ R2 ORB / 连接关闭容错：JustifiedGallery fallbackSrc（cover → thumbnail）
- ✅ 含 URL 主图 hover 灰色蒙版（grayscale + bg-black/45 + blur）+ 中央「Click to redirect to {真实URL}」
- ✅ Becoming Human 定制附页 `becomingHumanCollage5`（Row1 2 张 / Row2 3 张，同行等高）
- ✅ 移动端 <768px 响应式全覆盖审查（10 处 isMobile 分支 + 所有交互双端共享）
- ✅ 文档同步：`WORK_LAYOUT_TEMPLATES.md` 全重写 / `SUBPAGE_TEMPLATES.md` 全重写
- ✅ README.md（本文件）生成

### 文档索引

| 文档 | 内容 |
|---|---|
| [WORK_LAYOUT_TEMPLATES.md](./WORK_LAYOUT_TEMPLATES.md) | 作品主页 5 模板字段映射、代码位置、SafeImg / heroLink / heroCaption、移动端降级表、全局约定 |
| [SUBPAGE_TEMPLATES.md](./SUBPAGE_TEMPLATES.md) | 附页 9 通用 + 1 定制模板、cover/thumbnail/part 三路径体系、caption 五层归属表、JustifiedGallery 容错链路、响应式降级+稳定性表 |
