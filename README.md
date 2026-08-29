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
  - ⚠️ caption 是**唯一保持 10px 的文字区块**；标题 / 材料 / 描述 / 底部导航字号见下一节"全局字号对照表"
- **分类画廊字号**：桌面端 `clamp(14px, row.height × 13.5%, 48px)`，移动端 `clamp(1.1rem, 4.5vw, 2.25rem)`
- **可点击跳转图像**：双端共享 hover 灰色蒙版 + 中央「Click to redirect to {URL}」，200ms 淡入淡出（`group`/`pointer-events:none overlay`）

### 全局字号对照表（2026-08-29 统一）

| 模块 | 元素 | 字体 | 字号 | 样式 | 代码位置 |
|---|---|---|---|---|---|
| 作品详情主页 / 附页 | 标题 h1 | `TITLE_FONT`（serif italic）| **20px** | `text-gray-900 italic` | work-detail.tsx Hero\*/Centered/SideBySide 等 |
| 作品详情主页 / 附页 | 材料 p | `MONO_FONT`（monospace）| **14px** | `color:#464646 / 16pt line-height / sm:text-right 或 text-left` | work-detail.tsx materials 渲染 |
| 作品详情主页 / 附页 | 描述 `<p>` | `TITLE_FONT`（serif）| **12px** | `color:#464646 / 16pt line-height / **一律 text-left**` | work-detail.tsx 全模板 description |
| 作品主页 / 附页 / 画廊 | image caption / heroCaption | 默认 sans-serif | **10px（不变）** | `opacity 0.5 / text-center / text-gray-700` | 见上方 caption 样式 |
| 底部导航（PREV YEAR / PREV WORK / PREV SUB / NEXT）| `<Link>` 容器 | 默认 sans-serif | **12px** | `text-gray-600` | `app/works/[category]/[year]/page.tsx L123`、`[slug]/page.tsx L79/L160`（以前 `text-[10px]`，8-29 统一上调）|
| 分类画廊（WORKS/×××/YYYY）| 作品名 span | 默认 sans-serif | `text-sm = 14px` | `text-gray-700 leading-tight text-center` + `mt-2` 居中 | `justified-gallery.tsx` title 区 |

> 对齐规则补充：CenteredLayout 材料 text **左对齐**（2026-08-29 由 sm:text-right → text-left 覆盖）；Hero\* 标题行左/右边界 = 图片 wrapper 左/右边界（与 description 共用同一个 `width:imageWidthPercent%` 居中块，2026-08 修复）。

---

## 交互与体验机制（2026-08-29 轮新增）

本节记录所有"UI 层行为类"功能，后续新增交互时**同步维护一张"入口 / 代码 / 约束"表**，避免碎片化记忆。

### 1. Preview → 原图 + 全屏 Lightbox 浮窗

`components/previewable-image.tsx` 是作品详情页**所有 `<img>` 的外壳**。

```
用户首次进入作品页（preview.webp）
  │
  ├── 点击 "View original image" 按钮
  │     ├─ ① inline crossfade 300ms：preview.opacity 0.4 → 1 → 原尺寸 jpg 完整显示
  │     └─ ② 打开【单例全屏灰色 Lightbox】（由 LightboxProvider 提供，作用域仅限 WorkDetail，见下文）
  │
  └── 点击 文档流内的图片本身（grid/part-N/主图都一样）
        └─ 直接打开 Lightbox（等同于"再看图 → 放大"）
```

#### Lightbox 细节（决策 A1/B1/D3 固化）

| 项 | 值 |
|---|---|
| 作用域 | 只挂在 `WorkDetail` 外层（首页 / 画廊页没有 View original 入口，不挂载 Provider）|
| 遮罩 | `rgba(30,30,30,0.88)` 深灰半透明 88%，`fixed inset-0 z-[9999]`，opacity 180ms 淡入淡出 |
| 图片尺寸 | `max-width: calc(100vw − 80px); max-height: calc(100vh − 80px); width:auto; height:auto; object-fit: contain`（四边留白 40px，保证完整显示 + 尽可能大）|
| 关闭方式 | ① 点击遮罩**任何地方**（含图片本体）cursor-zoom-out 直接关；② 键盘 ESC；③ body 自动锁滚动（关时还原）|
| 叠化/扩展 | Provider 内部 `{open, src}` 状态；PreviewableImg 通过 `useLightbox()` 拿到 open 回调；所有 PreviewableImg 实例共享同一浮窗 |
| 不生效情况 | 当 `heroLink ?? work.link` 存在 → `ShowViewOriginalCtx=false`，按钮渲染但被 Context 隐藏（保持主图跳转外链语义优先）|

代码：
- [`components/previewable-image.tsx` LightboxProvider / useLightbox / PreviewableImg](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/previewable-image.tsx)
- [`components/work-detail.tsx` 顶部 `<LightboxProvider>` 挂载](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L77-L82)

### 2. 分类画廊：点击图片 or 点击作品名都跳详情页

`components/justified-gallery.tsx` 卡片结构：
```
<div flex-col shrink-0 (card) >
  <Link href={item.href}>    ← 原"点图跳转"入口
    <PreviewableImg/>
  </Link>
  <Link href={item.href}>    ← 2026-08-29 新增：名字独立包一层跳转（inline-block，hover 下划线）
    <span title>{item.title}</span>
  </Link>
</div>
```
- 作品区图片和标题两个独立 `<Link>` 互不影响；
- 标题 hover 时 `underline` 提示可点；标题**横向过长仍不换行**（不做 nowrap/clamp：保持浏览器默认 inline-block 换行，如果被"行高度预算 28px"裁切第 2 行是预期行为 X3）；
- 垂直方向 row 高度预算从 `titleGap=6 + showTitle=20`（合计 26）提高到 `titleGap=8 + showTitle=28`（合计 36）兜住 `p/y/g` 下延字母。

### 3. 首页（HOME section）灰色蒙版封面背景

`app/page.tsx` `section#home`：
```
<section relative overflow-hidden>
  <div absolute inset-0 bg-cover bg-center url(cover-1.webp)>   ← 方案 Bg + center 聚焦
  <div absolute inset-0 bg-white/60>                             ← 方案 1a 白蒙 60%
  <div relative z-10> 标题/副标题/描述 </div>                    ← 内容层抬 z
  <div relative z-10 sm:absolute bottom-8 right-8> contact 胶囊</div>
</section>
```
- 背景随 section（HOME）滚动（方案 4a），不影响 ABOUT/WORKS；
- 两个视觉层都是 `pointer-events: none` + `aria-hidden="true"`，不会截获点击/读屏；
- 背景图允许裁剪（cover 语义），聚焦点 center。

### 4. SideBySideLayout layout="right" 左文右图：图片一定贴容器**右边界**（方案 A2）

旧行为：`justify-content: flex-start` + 文本 `maxWidth:420px` 但实际宽<420 → 文本+图+gap"整体"左对齐，右边界漏出大片空白。

2026-08-29 改法：桌面端 wrapper 的 style 按 `imageSide` 分支
```
imageSide === "left"   → marginRight = GAP（整体 flex-start，图贴左，文在右跟）
imageSide === "right"  → marginLeft = auto（图用 auto margin 吃掉所有剩余空白，贴到最右）
```
结果：文本贴父容器左边界，图片贴父容器右边界，两者之间自动留下空白（不再恒定 gap）。`layout="left"` 的左图右文维持原行为不变（向后兼容、零回归面）。

### 5. JustifiedGallery DSL 升级：`LayoutRowSpec = number | {count, widthPercent?}`

为满足"Workshops 2026/2025 单图 50% 宽左对齐"、"Photograph & Videos 2026 三行各 50%"这类"非 100% 行宽"的需求，`layoutByYear` 的每一项从 `number`（按张数分行）升级为**联合类型**：

```ts
type LayoutRowSpec = number        // 向后兼容：等价于 { count: N, widthPercent: 100 }
                   | { count: number; widthPercent?: number }; // 1 ≤ widthPercent ≤ 100
```
- 当 `widthPercent < 100`：行内 children 宽度总和 = `containerWidth × widthPercent/100 − totalGap`，而行 `<div>` 本身保持 `width:100%`。因为外层 flex 默认 `justify-content: flex-start`，children 窄 → 自然"左对齐、右侧留白"，符合"50% 宽左对齐"语义。
- 解析函数 `parseLayoutSpec()` 负责 clamps：`count ≥ 1`，`widthPercent ∈ [1,100]`（非法值自动 clamp，不需要使用者手动校验）。
- 现有历史 `[3,3]` / `[2,1]` 等纯 number 数据 100% 向后兼容，无需批量迁移。

**已使用案例参考：**
```ts
// WORKS/Photograph & Videos/2026 → 3 行 × 各 1 张，各 50% 宽
layoutByYear: { 2026: [ {count:1,widthPercent:50}, {count:1,widthPercent:50}, {count:1,widthPercent:50} ] }

// WORKS/Workshops/2026 → 1 张单图 50% 宽左对齐（2025 同款）
layoutByYear: { 2026: [ {count:1,widthPercent:50} ] }
```
- MultiRowSubPage 同样支持 `widthPercent?: 1~100`（缺省 100），对应 God of Happiness 子页 1：`layout:"multiRow", rows:[[0,1,2]]`（整排 3 图 100% 全宽）/ 子页 2~4：`layout:"multiRow", rows:[[0]]`（单图 100% 全宽，原先 `layout:single` 的 80vh max-height 被移除，实现严格 S1 全宽自适应高度）。

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

### 本轮完成功能清单（2026-08-29 会话：布局 / 交互 / 字号统一）

**A. 单作品主页模板（layout 调整）**
- ✅ **Sinking**：`layout: wideBottom → wide → partial`（75% 居中 HeroImageLayout；显式 `images:[main-1]`）
- ✅ **New Narrative of Foshan**：`layout: right(SideBySide) → partial`（75% 居中 HeroImageLayout；显式 `images:[main-1]`）
- ✅ CenteredLayout 材料：`sm:text-right` → 永久 `text-left`（保持左基线一致）

**B. 附页布局调整**
- ✅ **God of Happiness 子页 1**：隐式 GridSubPage（50vh 固定高）→ 显式 `multiRow rows:[[0,1,2]]`（3 图同行 100% 全宽，无 max-height）
- ✅ **God of Happiness 子页 2/3/4**：`layout:single（80vh 高优先）→ multiRow rows:[[0]]`（严格 S1 全宽，去除 80vh 上限；仅影响 God of Happiness 3 张，未改 SubPageLayout 全局 single 分支）
- ✅ **FiveImageStackSubPage（Weishan Memory Ⅱ）**：桌面端三列布局重写（D1=Y 整体 justified scale, D2=P1 右列仅对齐右边界, D3=中心图堆叠不动, D4a=中心在上, D5a=不贴容器右边）
  - 新公式：`sideH_base = (H − gap)/2`、`fit_b = w_LT_b + 2·gap + w_C_b + w_RB_b`、`scale = clamp(0.1, min(1, totalW / fit_b))`
  - 定位：`leftLeft = 0`、`centerLeft = w_LT + gap`、`rightBottomLeft = centerLeft + w_C + gap`、`rightTopLeft = (rightBottomLeft + w_RB) − w_RT`（P1 保证右上图右 = 右下图右）
  - 堆叠：中心图 transform 恒为 `none`；四小图 `translate(dx,dy) scale(CENTER_W/imgW, CENTER_H/imgH)` 缩放到中心图 box；堆叠后 z 角图=1、中心=2（中心在上半透）

**C. 分类画廊 DSL & 交互**
- ✅ **Workshops 2025 / 2026**：`layoutByYear: [1]` → `[{count:1,widthPercent:50}]`（半宽左对齐，同 Photograph & Videos/2026）
- ✅ `WorkCategory.layoutByYear / getLayoutForYear()` 返回类型升级为 `LayoutRowSpec[]`，新增 `parseLayoutSpec()` 数值边界保护
- ✅ 分类画廊：点击**作品名**新增独立 `<Link>` 跳转详情页（和原"点图跳转"链路并行，hover 显示 underline）
- ✅ 分类画廊：标题行高度预算 `showTitle 20 → 28`，`titleGap 6 → 8`（兜住 `leading-tight` 下的 `p/y/g` 下延像素；长标题换行第 2 行仍会因 row 固定高裁切，约定 X3）

**D. 交互 / 视觉类（代码工程化落地）**
- ✅ **View original image → 全屏灰色 Lightbox 看图**：`LightboxProvider` + `useLightbox`；点击按钮或点击文档流图片打开浮窗；深灰 `rgba(30,30,30,0.88)`，四边留白 40px，点击任何地方（含图片）+ ESC 关闭，body 锁滚动。Provider 仅挂在 WorkDetail（首页/画廊无入口不挂载）。无 heroLink/work.link 时按钮正常，有则主图点击走外链，按钮不渲染。
- ✅ **HOME 首屏 cover-1.webp 背景 + 白蒙 60%**：`absolute inset-0 bg-cover bg-center` + `bg-white/60`，随 HOME section 一起滚动（方案 4a），不影响 ABOUT/WORKS。
- ✅ **SideBySideLayout layout="right" 右对齐修正（方案 A2）**：`imageWrapperStyle marginLeft = "auto"`，图贴容器右边界，文本贴左边界。

**E. 字号全局统一（2026-08-29，30/30 处命中，无误伤 caption）**
- ✅ 标题 `fontFamily: TITLE_FONT, fontSize: 18px → 20px`（5 处）
- ✅ 材料 `fontFamily: MONO_FONT,  fontSize: 12px → 14px`（5 处）
- ✅ 描述 `fontFamily: TITLE_FONT, fontSize: 10px → 12px`（20 处，描述 `<p>` 内部一律 `text-left`；caption/nav 10px 未被改动）
- ✅ 底部导航（画廊年/作品/附页三处 prev-next）`text-[10px] → text-[12px]`

### 数据覆盖率（2026-08-29 快照，31 作品不变）

同 §版本快照（2026-08-28）表：31 件作品 thumbnail & cover 100% 就位；本轮不增不减作品，仅变更 layout 与代码行为。

### 文档索引

| 文档 | 内容 | 最后修订 |
|---|---|---|
| [WORK_LAYOUT_TEMPLATES.md](./WORK_LAYOUT_TEMPLATES.md) | 作品主页 8 旧值→5 统一实现的字段映射、SideBySide A2 右图贴边、partial/wide/bottom 对比表、Centered 材料左对齐、全局字号表 | 2026-08-29 |
| [SUBPAGE_TEMPLATES.md](./SUBPAGE_TEMPLATES.md) | 附页 9 通用 + 1 定制；FiveImageStack 新公式；God of Happiness 3×single→multiRow 决策；multiRow widthPercent；single/multiRow 选型指南 | 2026-08-29 |
| `SKILLs/frontend-development/SKILL.md` | 通用前端工程化指南（本项目沉淀的样式规范可扩展） | 2026-08 |
