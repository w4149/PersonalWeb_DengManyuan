# 作品主页（Work.layout）模板使用说明（2026-08-29 修订）

适用于 `lib/works-data.ts` 中每个作品（`Work` 对象）首屏主图布局的 `layout` 字段。代码统一实现在 `components/work-detail.tsx` 内，由 `WorkDetail` 函数按 `work.layout` 值分发到 **5 个统一组件**。

> **关于「统一模板」的说明**：历史上存在 8 种 `layout` 字符串（`left/right/center/wide/partial/bottom/wideBottom/grid`），分别对应 8 个独立组件。现已合并简化为 5 个内部实现（SideBySide / Centered / HeroImageLayout / HeroImageBottomLayout / GridLayout），但 **数据里仍写原来的 8 种旧值**（向后兼容），映射关系由 WorkDetail 内部硬编码，使用方式无需改动。

---

## 一、Work 数据结构（主页相关字段 · 2026-08-29 快照）

```ts
import type { Work } from "@/lib/works-data";

const work: Work = {
  // —— 基础标识 ——
  slug: "world-tree",
  title: "World Tree",                          // 作品名（英文）
  displayTitle: "World Tree",                   // 可选：展示用的标题（和 slug/title 不同时才填）

  // —— 作品详情页 & 分类画廊「两套独立图片」——
  thumbnail: `${R2}/images/.../main-1.jpg`,     // 详情页主页/副图（HeroImageLayout 等布局渲染的主图）
  cover: `${R2}/images/paintings-2026/covers/world-tree.jpg`, // 仅 WORKS/Paintings/2026 分类画廊使用（缩略图），与 thumbnail 完全解耦
  coverAspectRatio: 1.3517,                      // 仅首屏 justified-gallery 对齐用，cover 比例 ≠ thumbnail 比例时填（消除首屏跳动）

  // —— 主页布局控制 ——
  aspectRatio: 1.3517,                           // 主图宽高比（降级用）
  layout: "partial",                             // 8 选 1，见下文总览
  imgWidthRatio: 0.75,                           // wide / partial / bottom / wideBottom：图片宽度占比（0~1）
  gridColumns: 2,                                // 仅 layout="grid"：≥768px 固定列数（不填则响应式 sm=2/lg=3）
  images: [                                      // HeroImageLayout 多图 / 显式指定单图（partial 建议填此项避免 fallback）
    { src: `${R2}/images/.../main-1.jpg`, alt: "Main 1" },
  ],

  // —— 文本内容（2026-08-29 字号固化，见 README"全局字号对照表"）
  materials: "Acrylic on canvas | 70cm × 45cm | 2026",// 媒介｜尺寸｜年份 （MONO_FONT 14px）
  description: "Long description text...",        // 描述，空行 \n 或 \n\n 分段 （TITLE_FONT 12px，text-left 永久）

  // —— 主图交互（全 layout 通用）
  heroLink: "https://youtu.be/xxxx",              // 主图点击→新标签页外链（优先于老字段 work.link）
  heroCaption: "A video documenting the process",// 主图正下方 caption（10px opacity-0.5 text-center；不受 12px 描述字号影响）
  link: "https://optional.legacy",                // 老字段：heroLink 没填时退而用之
  // ⚠️ 当 heroLink ?? link 存在时，"View original image" 按钮 & 全屏 Lightbox 不出现（主图跳转语义优先）

  // —— GridLayout / HeroImageMultiRow 多图 ——
  //    （如果 images[0] 是主页第一张主图，仍可写 caption / heroCaption 给它）
  //
  // —— 附页（见 SUBPAGE_TEMPLATES.md）——
  subPages: [{ layout: "multiRow", rows: [[0,1],[2,3]], images: [...] }],
};
```

R2 CDN 前缀：
```ts
import { R2 } from "@/lib/works-data";
// R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev"
```

> **⚠️ 编号（罗马数字前缀）默认关闭**：`WorkDetail` 的 `numStr` 统一设为空串。所有作品标题不会再显示 `「I. Title / IX. Title」` 前缀。如需重新启用，仅修改 `WorkDetail` 里 `const numStr = "";` 一行即可。

---

## 二、所有 layout 总览（8 种旧值 → 5 种统一实现）

| `work.layout` 旧值       | 对应内部统一组件        | 核心效果                                                                 | 额外配置项                          |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| `"left"`                 | `SideBySideLayout`      | **左右并排**：图片在**左**，文本在**右**；整体 `flex-start`（图贴左，文跟图）| 无                                  |
| `"right"`                | `SideBySideLayout`      | **左右并排**：图片在**右**，文本在**左**；⚠️ **2026-08-29 A2 修正**：`imageWrapperStyle.marginLeft = "auto"` → 图片**贴父容器右边界**，文本贴父容器左边界（不再恒定 24px 居中空白）| 无                                  |
| `"center"`               | `CenteredLayout`        | **居中单图**：图片水平居中，两侧留白相等；⚠️ **2026-08-29**：材料 `sm:text-right → 永久 text-left`（标题/材料/描述左基线一致） | 无                                  |
| `"wide"`                 | `HeroImageLayout`       | **顶图模板**：图片顶满整行宽（`imgWidthRatio` 强制 100%），紧贴标题行下方     | `imgWidthRatio`（wide 强制 1.0）   |
| `"partial"`              | `HeroImageLayout`       | **顶图模板**：图片占一行的 75%（或自定义比例），居中 ⭐ **2026-08-29 新增使用：Sinking / New Narrative of Foshan**（从 SideBySide / wide 切换过来） | `imgWidthRatio`（默认 0.75）；**推荐同时显式写 `images:[{src:thumbnail}]` 防止 fallback**        |
| `"bottom"`               | `HeroImageBottomLayout` | **上图下文本**：图片放 min-height 60vh 居中区域，比例默认 75%            | `imgWidthRatio`（默认 0.75）        |
| `"wideBottom"`           | `HeroImageBottomLayout` | **上图下文本**：图片放 min-height 60vh 居中区域，顶满 100%               | `imgWidthRatio`（wideBottom 强制1.0）|
| `"grid"`                 | `GridLayout`            | **多图网格**：首屏显示 `work.images[]` 所有图                           | `images` 必填；`gridColumns` 可选   |

---

## 三、5 个统一模板详细使用

### 1. `SideBySideLayout`（左右并排模板，对应 `layout: "left"` 和 `layout: "right"`）⭐

**适用场景：** 主图 + 名字/材料/描述在左右两侧并排，视觉平衡。

| layout 值        | 图片在哪一侧 |
|-----------------|--------------|
| `"left"`        | 左，文在右    |
| `"right"` / 默认 | 右，文在左  |

**结构特点（含 2026-08-29 行为修正）：**
- 外层桌面端 flex 容器：`justify-content: flex-start; width:100%`（**不再加 `justify-between` 或 `margin` 在容器层**）。
- 图片侧 style（`imageWrapperStyle`）**按 imageSide 分支**：
  ```
  imageSide === "left"  → flexShrink:0; marginRight = GAP(24)；
  imageSide === "right" → flexShrink:0; marginLeft = "auto";   // ← 2026-08-29 A2 修正
  ```
  - `"right"` 用 `marginLeft: auto` 吃掉所有剩余宽：**图片一定贴到父容器右边界**；文本贴父容器左边界；两者之间的空白 = 容器总宽 − 文本实际宽 − 图片实际宽（不再恒定 GAP）。
  - `"left"` 保持向后兼容：图贴左，文本面板在右跟（图右 margin 24）。
- 图片 `IMAGE_HEIGHT = 80vh`（桌面），移动端 `maxHeight 70vh` + `width:100%`，文本堆叠在图片下方；
- 文本面板最大宽 `LEFT_MAX_WIDTH = 420px`；标题 TITLE_FONT 20px；材料 MONO_FONT 14px；描述 TITLE_FONT 12px text-left；
- 若有 `heroLink` → 主图外包 `<a target=_blank>`，hover 灰色蒙版 + 中央跳转说明；若 `heroLink ?? link` 存在 → "View original image" 按钮 & Lightbox 不出现；
- 若有 `heroCaption` → 主图正下方 10px opacity 0.5 text-center。

```
layout = "right"（A2 修正后效果）：
┌─────────────────────────────────────────────────────────────────────┐
│ Title / Materials / Desc.（左贴） │     ←      │ Image（右贴容器边界）│
│ 420px 面板内左对齐                 │  ← 空白区→ │ 80vh · flexShrink:0│
└─────────────────────────────────────────────────────────────────────┘
```

示例写法：
```ts
{
  slug: "verdant-heaven",
  title: "Verdant Heaven",
  thumbnail: `${R2}/images/paintings-2024/verdant-heaven/main-1.jpg`,
  aspectRatio: 1.45,
  layout: "right",                      // ← 图贴右边界，文贴左
  materials: "Acrylic on canvas, ink, ballpoint pen | 40×55cm | 2024",
  description: "Combining traditional Shan Shui...\n\nVisual memories...",
}
```
代码：[work-detail.tsx → `SideBySideLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2969-L3162)

---

### 2. `CenteredLayout`（居中单图模板，对应 `layout: "center"`）

**适用场景：** 主图视觉水平居中，文本侧栏放在一侧但不影响图片重心。

**结构特点：**
- 通过 `ResizeObserver` 测量图片与容器宽 → 两侧 `panelWidth = (containerW − imageW) / 2 − GAP` 绝对相等；
- 标题 TITLE_FONT 20px；材料 MONO_FONT 14px ⚠️ **2026-08-29：材料从原 sm:text-right → 永久 `text-left`**（与标题/描述的左基线一致）；描述 TITLE_FONT 12px text-left；
- 桌面端图片 80vh 原比例 → 移动端 width:100% maxHeight 70vh，文本前置；
- `heroLink` / `heroCaption` 机制和 SideBySideLayout 完全一致。

代码：[work-detail.tsx → `CenteredLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2710-L2934)

---

### 3. `HeroImageLayout`（顶图模板，对应 `layout: "wide"` 和 `layout: "partial"`）⭐

**适用场景：** 标题+材料在上，主图紧跟其后居中，再挂描述；**不设 min-height**（短图不会撑大片空白）。⚠️ **这是 2026-08-29 切换模板最多的布局**。

| layout 值   | `imageWidthPercent`（图片占容器宽度比例）| 代表作品 |
|------------|------------------------------------------|---|
| `"wide"`   | 强制 100%                                 | Tree Spirit ⅠⅡⅢ（从 3 张同行 wide 切单图） |
| `"partial"`| 默认 75%，可通过 `imgWidthRatio` 改       | **Sinking（wideBottom→wide→partial）**、**New Narrative of Foshan（SideBySide→partial）** |

**结构特点（单图 vs 多图自动分流）：**
- **单图模式**（`work.images.length ≤ 1`）：主图 = `images[0] ?? thumbnail`；**锚点 `<a>` 自身就是 width N% 的含宽块**，`heroCaption` 在锚点下居中；
- **多图模式**（`work.images.length ≥ 2`）：委托给 `HeroImageMultiRow` 同行等高；
- 标题行 + 描述块 **统一用同一 `imageWidthPercent%` 宽度的"居中 wrapper"**：
  ```
  outer: flex justify-center
    inner w-full style.width = (imageWidthPercent × 100)%
      ├─ h1       text-left / serif 20px / 左边界 = 图片左边框
      └─ material sm:text-right / mono 14px / 右边界 = 图片右边框
    inner + image anchor（同样 imageWidthPercent%）
    inner + description p text-left（描述块左边界=图片左边界）
  ```
  这样"标题+材料"的整体宽度、图片宽度、描述宽度三者**左/右边缘严格重合**（2026-08 初统一）。
- 有 heroLink/link：hover 灰色蒙版 + grayscale 200ms 过渡；无 heroLink/link → "View original image" 按钮 + 全屏 Lightbox 浮窗（见 README 交互机制 §1）。

```
layout = "partial" (imgWidthRatio = 0.75)：
┌──────────────────────────────────────────┐
│ Title (left, 20px serif)   Materials (14px mono, right)│ ← 宽度 = 75%
├──────────────────────────────────────────┤
│          ┌────────────────────┐          │ ← 75% 宽锚点（<a> 或 <div>）
│          │  ┌──────────────┐  │          │ ← hover: 灰色蒙版 + 跳转/View original
│          │  │ Image graysc │  │          │
│          │  └──────────────┘  │          │
│          └────────────────────┘          │
│          heroCaption: 10px 0.5 (center)   │
│          ┌────────────────────┐          │
│          │ Description (12px TITLE_FONT, text-left)│ ← 块居中、75% 宽，文字左对齐
│          └────────────────────┘          │
```

示例（Sinking 切到 partial 的写法，显式 images=[main-1] 防止 HeroImageRow 退回 thumbnail 分支带来的首屏抖动）：
```ts
{
  slug: "sinking",
  title: "Sinking",
  thumbnail: `${R2}/images/paintings-2025/sinking/main-1.jpg`,
  cover: `${R2}/images/paintings-2025/covers/sinking.jpg`,
  aspectRatio: 1.2281,
  layout: "partial",                 // ← 2026-08-29 wide → partial
  images: [{                          // ← 2026-08-29 新增：显式主图
    src: `${R2}/images/paintings-2025/sinking/main-1.jpg`,
    alt: "Sinking",
  }],
  materials: "quartz sand, acrylic, ink, chalk, gauze, ballpoint pen, plaster mixed media on oil canvas | 40cm × 60cm, 2025",
  description: "...",
}
```
代码：
- [work-detail.tsx → `HeroImageLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2521-L2593)
- [work-detail.tsx → `HeroImageRow`（单/多图分流 + overlay）](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2321-L2399)
- [work-detail.tsx → `HeroImageMultiRow`（同行等高 + 逐图 heroLink 包装）](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2361-L2470)

---

### 4. `HeroImageBottomLayout`（上图下文本模板，对应 `layout: "wideBottom"` 和 `layout: "bottom"`）

**适用场景：** 主图像 Hero Banner 一样占足垂直空间（min-height 60vh），描述远离主图、靠近底栏。

| layout 值       | 图片占比 |
|----------------|---------|
| `"wideBottom"` | 100%    |
| `"bottom"`     | 默认 75%，可改 `imgWidthRatio` |

**和 HeroImageLayout 的唯一区别**：`areaStyle = { minHeight: "60vh", marginTop: "16px", justifyContent: "center", alignItems: "flex-start" }` → 主图在 60vh 区域内**顶中对齐**，描述远在 60vh 区域之后。多图 / 单图、hover 蒙版、标题行+描述 wrapper 宽度对齐、heroCaption、Lightbox 规则全部复用 HeroImageLayout。

> 何时避免用 wideBottom / bottom？当主图 aspectRatio 偏小（横图但高度短），60vh 固定容器会让图片上方大片留白时，优先改到 `wide / partial`（参考 2026-08-28 Sinking 从 wideBottom → wide → partial 的切换路径）。

代码：[work-detail.tsx → `HeroImageBottomLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2596-L2664)

---

### 5. `GridLayout`（多图网格模板，对应 `layout: "grid"`）⭐

**适用场景：** 作品主页本身是多幅图（如 A Joke on Fragmented Shan Shui 的 2×10 圆形小品 10 张），而不是单幅主图 + 附页。

**必填 & 可选：**
- 必填：`work.images[]`（每图 `{src, alt, caption?}`）
- 可选：`gridColumns: number`（≥768px 固定列数，默认空 → sm:2 lg:3 响应式）
- 可选：title / materials / description → 标题行结构和 HeroImageLayout 一致。

**响应式列数：**
```
移动端 <768px    : 1 列（强制 grid-cols-1）
sm+ ≥768px
  ├─ gridColumns = 2 → 固定 repeat(2, 1fr)
  ├─ gridColumns = N → 固定 repeat(N, 1fr)
  └─ 未填（默认）    → sm:grid-cols-2 / lg:grid-cols-3
```

**每图结构（永久图底 caption）：**
```
<div class="flex flex-col items-center w-full">
  <div class="w-full">                         ← 图框
    <SafeImg object-contain block w-full style=maxHeight:60vh />
  </div>
  <p class="mt-2 w-full text-center 10px opacity-0.5">Caption（例如 Ⅰ~Ⅹ 罗马数字）</p>
</div>
```
⚠️ 2026-08-29 修正：GridLayout 主描述段落 `<p>` **一律 `text-left`**（原 `sm:text-center` 在桌面下导致居中偏移，和 Hero/Centered 描述基线不一致，已移除）。

示例（A Joke on Fragmented Shan Shui：固定 2 列 × 10 行，Roman 数字每格 caption）：
```ts
{
  slug: "a-joke-on-fragmented-shan-shui",
  layout: "grid",
  gridColumns: 2,
  thumbnail: `${R2}/.../part-1.jpg`,        // 分类画廊缩略图用
  cover: `${R2}/paintings-2025/covers/a-joke-on-fragmented-shan-shui.jpg`,
  materials: "Ink and Chinese pigments on canvas | Ø 20cm | 2025",
  description: "I deconstruct and reassemble...",
  images: [
    { src: `${R2}/.../part-1.jpg`,  caption: "Ⅰ" },
    { src: `${R2}/.../part-2.jpg`,  caption: "Ⅱ" },
    // ... part-10.jpg → caption Ⅹ
  ],
}
```
代码：[work-detail.tsx → `GridLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L2666-L2801)

---

## 四、通用机制（所有 layout 共享 · 2026-08-29 修订）

### 4.1 字号与对齐（全局固化，改一处即可）
见 README「移动端规范 → 全局字号对照表」。记住：
- 标题 = **20px（TITLE_FONT italic serif）**；材料 = **14px（MONO_FONT）**；描述 = **12px（TITLE_FONT serif text-left）**。
- Caption / heroCaption / SafeImg 图下小字 = **10px（sans，opacity 0.5，永不改）**。
- 底部 prev/next 导航 = **12px**（2026-08-29 统一自 10px）。

### 4.2 Hero* 标题-材料 wrapper 宽度同步
HeroImageLayout / HeroImageBottomLayout 的"标题行"和"描述块"、和"图像锚点"**共用同一个 imageWidthPercent 的外层 flex justify-center 容器**。这是保证：
- h1 左边缘 = 图像左边缘；
- 材料右边缘 = 图像右边缘；
- 描述宽度 = 图像宽度；
三对齐的关键。如果新增 Hero 变体，**不要在标题行单独写 `w-full + justify-between`**（这是已踩过的坑）。

### 4.3 SafeImg 三级容错（防 R2 ORB / 404 / 连接关闭）
```
阶段 0：原始 src (main-1 / part-N)
   │ onError
   ▼
阶段 1：work.thumbnail
   │ onError
   ▼
阶段 2：内联 data-URI SVG
```
作品详情所有 img 都包 SafeImg；PreviewableImg 在预览→原图阶段也用 SafeImg 两层容器，404/ORB 不影响 inline crossfade & Lightbox。

### 4.4 Preview → 原图 + 全屏 Lightbox（无 heroLink/link 时）
见 README「交互与体验机制 §1」。关键：Provider 仅挂在 `WorkDetail`，所以首页/画廊不会出现 z-index 9999 的遮罩（作用域最小化）。
```
组件：`components/work-detail.tsx → SafeImg`（L29-L78）。所有作品主页 + 所有附页图片渲染统一走 `<SafeImg>`，不再直接 `<img>`。

### 4.2 heroLink hover 灰色蒙版 + 中央跳转提示
只要 `heroLink`（或老字段 `link`）存在，锚点 `<a>` 就带 `group`：
```
hover: opacity-0 → opacity-100（200ms 过渡）
  ├─ 图片本身：group-hover:grayscale（完整去色）
  └─ 蒙版层：absolute inset-0 bg-black/45 + backdrop-blur 1px + 居中两行白字
       ├─ Click to redirect to
       └─ {https://真实-URL.com/xxxx}（12px，长链接自动 break-all）
```
实现：`wrapHeroImgWithLink`（通用函数，SideBySide/Centered/HeroImageMultiRow 公用）+ HeroImageRow 单图分支 内联 overlay。

### 4.3 主图下方 caption（heroCaption）
样式和分类画廊 / GridSubPage caption 完全一致：
- `mt-2 / fontSize 10px / text-gray-700 / opacity 0.5 / text-center`
- 支持 `|` 或 `\n` 拆多行（`renderCaptionText`）

---

## 五、作品主页 & 附页的关系

```
Work 数据：
├── layout: "partial"            ← 【主页】首屏：HeroImageLayout 主图（work.thumbnail 或 work.images）
│                                    标题 + materials + description + heroCaption(可跳外链)
└── subPages: [                  ← 【附页】0~N 个，按顺序翻页
      { layout: "multiRow", rows: [[0,1,2],[3,4],[5,6,7]] },
      { layout: "sevenSplit", ... },
      { layout: "becomingHumanCollage5", images: [part-8..part-12] },
    ]
```

- 路由：`/works/[category]/[year]/[slug]` → 首屏渲染主页；底部 Next/Prev SubPage 在主页 ↔ 附页、附页之间切换。
- **GridLayout（主页） vs GridSubPage（附页）**：
  - GridLayout：响应式 1/2/3 列网格，永久图底 caption，适合 GridLayout 主页。
  - GridSubPage：**同行等高一行**（不分列），真实 dims 归一化，适合附页横排展示组图。

附页模板文档：[SUBPAGE_TEMPLATES.md](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/SUBPAGE_TEMPLATES.md)

---

## 六、移动端适配（断点：< 768px）

所有模板都有 `useEffect(window.innerWidth < 768)` + ResizeObserver 双保险监听，每模板对应移动分支：

| 模板                  | 桌面                              | 移动端 <768px 降级                                                                 |
|-----------------------|-----------------------------------|----------------------------------------------------------------------------------|
| SideBySideLayout      | 左右并排                          | 堆叠：图片上（width 100% maxH 70vh）+ 文本下（mt-16px）                          |
| CenteredLayout        | 居中 + 左/右 panel                | 堆叠：文本先（width 100%）+ 图片后（width 100% maxH 70vh）                        |
| HeroImageLayout/Bottom| 百分比宽度居中 + 多图同行等高     | 不变（百分比宽度自动根据窄屏重新分配宽度；多图同行等高仍工作，图自然变小没问题）   |
| GridLayout 网格       | ≥768px gridColumns N 列或 sm2/lg3 | 强制 1 列（max 60vh）                                                             |
| 全部附页模板          | 复杂拼贴 / 双栏 / 同行等高        | 统一按 images[0..n-1] 顺序纵向堆叠，每张 w-full/h-auto/maxHeight 60vh             |

本轮新增的 **heroCaption / heroLink hover 蒙版 / SafeImg fallback** 均写在响应式分支**外**（即同时套在桌面和移动包装的根级），移动端自然生效（触屏 tap=hover；点击仍跳转外链）。

---

## 七、全局约定

- 所有图片 `src`：`${R2}/images/{category}-{year}/{slug}/main-1.ext`（详情主页图）或 `/part-N.ext`（附页组图）。
- R2 文件命名：罗马数字使用真实 Unicode 字符 `ⅰ`/`ⅱ`（U+2170/2171），**不要写成字母 i/ii**。
- **Cover 目录**：`/images/{category}-{year}/covers/{slug}.jpg/png`（分类画廊专用缩略图，和主图 main-1.* 完全解耦）。
- 间距常量：`GAP = 24px`（`import { GAP } from "@/lib/gallery-config"`）。
- 字体规格：标题 `serif` 18px / 材料 `monospace` 12px 16pt `#464646` / 描述 `serif` 10px 16pt `#464646` / 画廊 caption `sans-serif` 10px opacity 0.5 text-center。
- 描述分段：`\n\n`（双换行）或 `\n`（单换行）或 `|` 分隔 → 统一走 `renderDescription` / `renderCaptionText`。
- 类型验证：**每次修改 `works-data.ts` 或组件后必跑 `npx tsc --noEmit`**，零输出才算通过。
