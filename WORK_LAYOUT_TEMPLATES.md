# 作品主页（Work.layout）模板使用说明

适用于 `lib/works-data.ts` 中每个作品（`Work` 对象）首屏主图布局的 `layout` 字段。代码统一实现在 `components/work-detail.tsx` 内，由 `WorkDetail` 函数按 `work.layout` 值分发到 **5 个统一组件**。

> **关于「统一模板」的说明**：历史上存在 8 种 `layout` 字符串（`left/right/center/wide/partial/bottom/wideBottom/grid`），分别对应 8 个独立组件。现已合并简化为 5 个内部实现（SideBySide / Centered / HeroImageLayout / HeroImageBottomLayout / GridLayout），但 **数据里仍写原来的 8 种旧值**（向后兼容），映射关系由 WorkDetail 内部硬编码，使用方式无需改动。

---

## 一、Work 数据结构（主页相关字段）

```ts
import type { Work } from "@/lib/works-data";

const work: Work = {
  slug: "world-tree",
  title: "World Tree",                   // 作品名（英文）
  displayTitle: "World Tree",            // 可选：展示用的标题（如果和 slug/title 不一样）
  thumbnail: `${R2}/images/.../main.jpg`,// 首屏主图（grid layout 时忽略该字段，改用 work.images[]）
  aspectRatio: 0.5771,                   // 主图宽高比（缩略图列表用，主页布局本身不依赖此值，以图片原始比例为准）
  layout: "center",                      // 布局类型（见下表，8 选 1）
  description: "作品描述文本（可选）",     // 段落间用空行 "\n" 分隔，会被自动转 <br>
  materials: "尺寸、媒介、年份（可选）",    // 一行文本，右侧对齐，monospace 字体
  imgWidthRatio: 0.75,                   // 仅 wide / partial / bottom / wideBottom 生效：图片宽度占容器比例（0~1）
  images: [{ src, alt }],                // 仅 layout === "grid" 生效：网格要显示的多张图
  // link?: string                        // 可选：外链地址（首图上包裹 <a> 跳转）
  // subPages?: SubPage[]                 // 附页（见 SUBPAGE_TEMPLATES.md，和本文件无关）
};
```

图片路径前缀：
```ts
import { R2 } from "@/lib/works-data";
// R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev"
```

---

## 二、所有 layout 总览（8 种旧值 → 5 种统一实现）

| `work.layout` 旧值       | 对应内部统一组件        | 核心效果                                                                 | 额外配置项                  |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------ | --------------------------- |
| `"left"`                 | `SideBySideLayout`      | **左右并排**：图片在**左**，文本在**右**                                 | 无                          |
| `"right"`                | `SideBySideLayout`      | **左右并排**：图片在**右**，文本在**左**；**未写 layout 时的默认值**     | 无                          |
| `"center"`               | `CenteredLayout`        | **居中单图**：图片水平居中，两侧留白相等，文本在**右**侧栏               | 无                          |
| `"wide"`                 | `HeroImageLayout`       | **顶图模板**：图片顶满整行宽（`imgWidthRatio` 100%），紧贴标题行下方     | `imgWidthRatio`（默认 1.0） |
| `"partial"`              | `HeroImageLayout`       | **顶图模板**：图片占一行的 75%（或自定义比例），居中                     | `imgWidthRatio`（默认 0.75）|
| `"bottom"`               | `HeroImageBottomLayout` | **上图下文本**：图片放在 min-height 80vh 居中区域内，图片比例 75%         | `imgWidthRatio`（默认 0.75）|
| `"wideBottom"`           | `HeroImageBottomLayout` | **上图下文本**：图片放在 min-height 80vh 居中区域内，图片顶满 100%       | `imgWidthRatio`（默认 1.0） |
| `"grid"`                 | `GridLayout`            | **多图网格**：首屏显示 `work.images[]` 所有图（响应式 1/2/3 列）         | `work.images` 为必填        |

---

## 三、5 个统一模板详细使用

### 1. `SideBySideLayout`（左右并排模板，对应 `layout: "left"` 和 `layout: "right"`）⭐

**适用场景：** 主图 + 名字/材料/描述在左右两侧并排，视觉平衡。

**映射：**
| layout 值 | imageSide（图片在哪一侧） |
|----------|--------------------------|
| `"left"` | `"left"`（图在左，文在右）|
| `"right"` / 不写 | `"right"`（图在右，文在左，**默认**）|

**结构特点：**
- 图片侧 `flexShrink: 0`（先保证图片宽度，不够时文本面板先收缩换行）；
- 文本面板：最大宽 420px，最小宽 0；
- 标题 18px serif，**材料 12px mono 左对齐**（单列内所有文本统一左对齐），描述 10px serif；
- 图片高度 `80vh`，宽度按原始比例自适应，`max-width: 100%`；
- 可选 `work.link`：存在时主图会包 `<a target="_blank">` 跳转。

> **和 HeroImageLayout/CenteredLayout 的区别**：另外三个模板是「Title 和 Materials 在同一行左右分布」，所以 Materials 右对齐；而 SideBySideLayout 是「单列内 Title / Materials / Description 依次垂直堆叠」，所以全部左对齐，视觉更连贯。

```
layout = "right"（图在右，文在左）：
┌──────────────────────────────┐  GAP  ┌───────────┐
│  Title (18px serif)          │  24px │           │
│  Materials (12px mono, 左)   │       │   Image   │  ← flexShrink:0
│  Description (10px serif)    │       │  h:80vh   │
│  ...（可多段）               │       │           │
└──────────────────────────────┘       └───────────┘
      textPanel（max 420px，全部左对齐）
```

**`lib/works-data.ts` 写法：**
```ts
// 图在右（默认）
{
  slug: "tree-pulse",
  title: "Tree Pulse",
  thumbnail: `${R2}/images/paintings-2026/tree-pulse.jpg`,
  aspectRatio: 0.7908,
  layout: "right",
  materials: "acrylic painting on paper, 27×35cm, 2026",
  description: "This work depicts the internal structure...",
}

// 图在左
{
  slug: "xxx",
  layout: "left",
  // 其他字段同上
}
```

对应代码：[work-detail.tsx → `SideBySideLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L1883-L2020)

---

### 2. `CenteredLayout`（居中单图模板，对应 `layout: "center"`）

**适用场景：** 主图视觉居中（水平中心对齐），文字放在一侧但不干扰图片视觉重心，适合强调单幅作品本身。

**结构特点：**
- 图片**水平居中**，左右两侧留白严格相等；
- 文本面板宽度 = `(容器宽 − 图片宽) / 2 − GAP`，通过 `ResizeObserver` 实时测量容器和图片宽度，文字在哪一侧都不影响图片视觉中心；
- 标题在文本面板顶部（18px serif），材料 12px mono 右对齐，描述 10px serif；
- 图片高度 `80vh`，宽度按原始比例自适应，`max-width: 100%`。

```
layout = "center"（文字在右）：
┌────────────┐  ┌──────────────┐  ┌────────────┐
│            │  │              │  │  Title     │  ← 文本面板放在右侧
│   (留白)   │  │    Image     │  │  Materials │
│            │  │  (水平居中)  │  │  Desc...   │
└────────────┘  └──────────────┘  └────────────┘
   panelWidth                         panelWidth
→ panelWidth 左右相等，图片真正居中
```

**`lib/works-data.ts` 写法：**
```ts
{
  slug: "world-tree",
  title: "World Tree",
  thumbnail: `${R2}/images/paintings-2026/world-tree.jpg`,
  aspectRatio: 0.5771,
  layout: "center",
  materials: "acrylic painting on canvas, 60×100cm, 2026",
  description: "The World Tree stands as a cosmic axis...",
}
```

对应代码：[work-detail.tsx → `CenteredLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L1735-L1881)

---

### 3. `HeroImageLayout`（顶图模板，对应 `layout: "wide"` 和 `layout: "partial"`）⭐

**适用场景：** 作品名/材料在上，主图紧跟其后居中显示，下方再跟描述；不要被最小高度限制（长图可以一直延伸，短图也不会撑出大片空白）。

**映射：**
| layout 值 | `imageWidthPercent`（图片占整行宽度比例） |
|----------|-------------------------------------------|
| `"wide"` | 100%（顶满整行，**忽略 `imgWidthRatio`**）|
| `"partial"` | `work.imgWidthRatio * 100`，默认 75%（没写 `imgWidthRatio` 时取 0.75） |

**结构特点：**
- 标题行：Title 左对齐（18px serif）+ Materials 右对齐（12px mono）；
- 图片：水平居中，宽度 = `imageWidthPercent%`，`max-height = calc(100vh − 200px)`；
- **关键**：**没有 min-height 包裹图**（图片紧贴标题行下方，不会因为图片短而在图和描述间出现大块空白）；
- 描述（可选）：居中显示，宽度与图片**对齐**（图片 75% 宽，描述也是 75% 宽）。

```
layout = "partial"（imgWidthRatio = 0.75，图片 75% 宽）：
┌──────────────────────────────────────────────┐
│  Title (左, 18px serif)   Materials (右, mono)│  ← mb-2
├──────────────────────────────────────────────┤
│              ┌────────────────────┐          │
│              │    Image 75% 宽    │          │  ← 没有 min-height，
│              └────────────────────┘          │    紧跟标题行下方
│                                              │
│              ┌────────────────────┐          │
│              │  Description 文本  │          │  ← 宽度和图片对齐（75%）
│              └────────────────────┘          │
└──────────────────────────────────────────────┘
```

**`lib/works-data.ts` 写法：**
```ts
// 例 A：wide（顶满 100% 宽）
{
  slug: "worlding",
  title: "Worlding",
  thumbnail: `${R2}/images/paintings-2026/worlding.jpg`,
  aspectRatio: 1.8887,
  layout: "wide",
  materials: "Chinese pigment on paper, 68×33.5cm, 2026",
  description: "Integrating explorations of the body...",
  // 自动 imageWidthPercent = 100%
}

// 例 B：partial（75% 宽或自定义比例）
{
  slug: "the-mountain-of-spirits",
  title: "The Mountain of Spirits",
  thumbnail: `${R2}/images/paintings-2026/the-mountain-of-spirits.jpg`,
  aspectRatio: 1.3517,
  layout: "partial",
  imgWidthRatio: 0.75,  // 可选，默认 0.75
  // materials / description 可选
}
```

对应代码：[work-detail.tsx → `HeroImageLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L1492-L1563)

---

### 4. `HeroImageBottomLayout`（上图下文本模板，对应 `layout: "wideBottom"` 和 `layout: "bottom"`）⭐

**适用场景：** 标题 + 材料在上，主图需要"像一张 Hero Banner 一样"占据大片视觉区域（无论图片多短都要留出足够的垂直空间），描述放在页面底部远离图片的位置。

**映射：**
| layout 值 | `imageWidthPercent`（图片占整行宽度比例） |
|----------|-------------------------------------------|
| `"wideBottom"` | 100%（顶满整行，**忽略 `imgWidthRatio`**）|
| `"bottom"` | `work.imgWidthRatio * 100`，默认 75%（没写时取 0.75）|

**和 HeroImageLayout 的核心区别：**
图片放在 `min-height: 80vh` 的 flex 居中区域内（`justify-center items-start`）→ 无论图片多短，都至少预留 80vh 的视觉空间，让图片位于该区域的**上中部**，描述则出现在 80vh 区域之后、视觉上靠近页面底部。

```
layout = "bottom"（imgWidthRatio = 0.8，图片 80% 宽）：
┌──────────────────────────────────────────────┐
│  Title (左)             Materials (右, mono)  │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │  ← min-height: 80vh
│  │     ┌──────────────────────────┐       │  │
│  │     │    Image 80% 宽          │       │  │  ← 区域内居中显示
│  │     └──────────────────────────┘       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│      ┌────────────────────────────┐          │
│      │   Description 文本         │          │  ← 宽度与图片对齐（80%）
│      └────────────────────────────┘          │
└──────────────────────────────────────────────┘
```

**`lib/works-data.ts` 写法：**
```ts
// 例 A：wideBottom（100% 宽）
{
  layout: "wideBottom",
  title: "...",
  materials: "...",
  description: "可选描述",
  thumbnail: `${R2}/images/.../main.jpg`,
}

// 例 B：bottom（75% 宽或自定义比例）
{
  layout: "bottom",
  title: "...",
  materials: "...",
  description: "可选描述",
  thumbnail: `${R2}/images/.../main.jpg`,
  imgWidthRatio: 0.8,  // 可选，默认 0.75；仅 "bottom" 生效（wideBottom 强制 100%）
}
```

对应代码：[work-detail.tsx → `HeroImageBottomLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L1569-L1638)

---

### 5. `GridLayout`（多图网格模板，对应 `layout: "grid"`）

**适用场景：** 作品主页本身就想展示多幅图片（而不是靠后续的附页），例如组画/系列作品。

**必填字段：**
- `work.images`：`{ src, alt }[]` 数组——网格要显示的所有图（`work.thumbnail` 和 `work.aspectRatio` 在该 layout 下仅供画廊缩略图列表使用，主页不展示）

**可选字段：**
- `work.title` / `displayTitle` / `materials` / `description`：显示在网格上方，结构和 HeroImageLayout 的标题行一致（Title 左 + Materials 右，描述居中且宽度和网格视觉对齐）。

**响应式列数：**
- 移动端 `< 768px`：1 列
- 平板 `768px ~ 1023px`：2 列（`sm:grid-cols-2`）
- 桌面 `≥ 1024px`：3 列（`lg:grid-cols-3`）
- 图片最大高度 `60vh`，保持原始宽高比，`object-contain` 不裁剪。

```
lg 断点（3 列）：
┌────────────┬────────────┬────────────┐
│  Title 左  │ Materials 右 (mono)     │
├────────────┴────────────┴────────────┤
│  Image 0  │  Image 1  │  Image 2    │
│  max 60vh │  max 60vh │  max 60vh   │
├────────────┼────────────┼────────────┤
│  Image 3  │  Image 4  │  Image 5    │
├────────────┴────────────┴────────────┤
│         Description 文本（居中）     │
└──────────────────────────────────────┘
```

**`lib/works-data.ts` 写法：**
```ts
{
  slug: "a-joke-on-fragmented-shan-shui",
  title: "A Joke on Fragmented Shan Shui Ⅰ~Ⅹ",
  displayTitle: "A Joke on Fragmented Shan Shui Ⅰ~Ⅹ",
  thumbnail: `${R2}/images/paintings-2025/xxx/dsc02784.jpg`, // 仅缩略图列表用
  aspectRatio: 1.0336,                                         // 仅缩略图列表用
  layout: "grid",
  materials: "Chinese pigment on paper, 2025",
  description: "可选描述文本",
  // work.images 才是 GridLayout 实际会渲染的图
  images: [
    { src: `${R2}/images/paintings-2025/xxx/part-1.jpg`, alt: "Part Ⅰ" },
    { src: `${R2}/images/paintings-2025/xxx/part-2.jpg`, alt: "Part Ⅱ" },
    { src: `${R2}/images/paintings-2025/xxx/part-3.jpg`, alt: "Part Ⅲ" },
    // ...
    { src: `${R2}/images/paintings-2025/xxx/part-10.jpg`, alt: "Part Ⅹ" },
  ],
}
```

对应代码：[work-detail.tsx → `GridLayout`](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/components/work-detail.tsx#L1640-L1733)

---

## 四、作品主页与附页的关系

```
Work 数据：
├── layout: "right"                ← 【主页】首屏：第 1 张主图（work.thumbnail）走 SideBySideLayout
│                                    └─ 内容：title + materials + description + thumbnail
├── subPages: [                    ← 【附页】翻页时依次显示（见 SUBPAGE_TEMPLATES.md）
│     { layout: "grid", images: [...] },
│     { layout: "multiRow", rows: [[0,1],[2,3]], images: [...] },
│   ]
```

- 每个作品有且仅有 **1 个主页**（由 `work.layout` 决定），展示在路由 `/works/[category]/[year]/[slug]` 进入时的首屏。
- 主页之后可以挂 **0~N 个附页**（`work.subPages[]`），浏览时通过页面底部「Next SubPage / Prev SubPage」在附页之间切换（附页模板详见 [SUBPAGE_TEMPLATES.md](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/SUBPAGE_TEMPLATES.md)）。
- `GridLayout`（主页）vs `GridSubPage`（附页）：
  - `GridLayout`：**多列网格**（1/2/3 列响应式），用 `work.images[]`，适合展示系列作品缩略图。
  - `GridSubPage`：**单行宽度优先**（无论多少张图都排在一行按比例分配宽度），用 `subPage.images[]`，是附页的默认回退布局。

---

## 五、约定

- 所有图片 `src` 使用 `${R2}/images/...`，勿用本地路径
- 文件名带罗马数字时使用真实字符：`ⅰ`（U+2170）、`ⅱ`（U+2171），不要写数字 `i`
- 间距统一使用常量 `GAP = 24px`（在子组件内通过 `import { GAP } from "@/lib/gallery-config"` 引用）
- 文本字体：标题 `serif` 18px，材料 `monospace` 12px/16pt 右对齐，描述 `serif` 10px/16pt
- 描述文本内段落用空行（`"\n"`）分隔，会被自动渲染为 `<br>` 实现段间换行
- 响应式断点：< 768px 视为手机端，所有布局会切换为垂直堆叠
