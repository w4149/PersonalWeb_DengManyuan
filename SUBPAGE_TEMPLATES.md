# SubPage 附页模板使用说明

适用于 `lib/works-data.ts` 中每个作品的 `subPages?: SubPage[]` 字段。

---

## 一、通用结构

```ts
import type { SubPage } from "@/lib/works-data";

const subPage: SubPage = {
  layout: "...",          // 模板类型，见下表
  images: [               // 该附页要用到的所有图片
    { src: `${R2}/images/.../part-1.jpg`, alt: "说明文字（可选）" },
    { src: `${R2}/images/.../part-2.jpg`, alt: "说明文字（可选）",
      caption: "图注（仅 grid 生效，鼠标 hover 图片时蒙版显示在中心，| 和 \\n 都是换行）" },
  ],
  description: "整页描述文本（可选，大多数模板支持）",
  rows: [[0, 1], [2, 3]], // 仅 multiRow 生效，控制每行放哪几张图
};
```

图片路径前缀：
```ts
import { R2 } from "@/lib/works-data";
// R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev"
```

---

## 二、所有模板清单

| layout 名称              | 含义                                                              | description | 每行独立配置 |
| ------------------------ | ----------------------------------------------------------------- | ----------- | ------------ |
| `"grid"`                 | **通用单行宽度优先布局** ⭐（默认回退）：支持 per-image hover 蒙版 caption（\|/\n 换行）+ 整页描述 | 支持 | 无 |
| `"single"`               | 单张图 + 下方描述                                                 | 支持        | 无           |
| `"stackedRight"`         | 右图大 + 左列两小张上下叠放 + 底部描述                             | 支持        | 无           |
| `"textLeftStackedRight"` | 左栏描述文本 + 中间两图上下 + 右栏大图                             | 支持        | 无           |
| `"fiveImageStack"`       | 左中右三栏 5 图 + 点击中图叠化动效                                 | 不支持      | 无           |
| `"row"`                  | **单行**宽度优先：等高度按比例分配宽度，底部对齐                  | 不支持      | 无           |
| `"multiRow"`             | **若干行**宽度优先，每行任意张数，可选底部整页描述 ⭐ 推荐         | 支持        | `rows` 字段  |
| `"leftMainRightStacked"` | 左图（下接描述）+ 右图上大图 + 右下图 3 张一行                     | 支持        | 无           |
| `"rowCaption"`           | ⚠️ **已合并到 `grid`**（向后兼容，数据仍可写，实际走 grid 逻辑） | 支持 | 无 |

> **关于 `grid` 和 `rowCaption` 的合并**：`grid` 现在会**自动**检测 `images` 中是否存在非空 `caption`。如有 caption → 鼠标 hover 图片时显示**灰色蒙版+图片中心白色 10px 文字**（不再物理预留底部空间）；如无 caption → 纯图片视觉。两种模式容器高度都为 `50vh`、按宽高比比例分配宽度、支持 `description` 整页描述。caption 内的 `|` 或 `\n` 都作为换行。原 `rowCaption` 值仍可在数据中使用（向后兼容，效果等同写 `"grid"`）。

---

## 三、各模板详细使用

### 1. `"multiRow"` ⭐ 新通用模板（宽度优先）

**适用场景：** 想把若干图片分到几行，按页面宽度分配比例，不需写死高度。

**必填：** `images`
**可选：** `rows`（默认所有图片单行）、`description`（显示在所有行下方，10px / 16pt / serif）

**示例 A：4 张图同一行**
```ts
{
  layout: "multiRow",
  images: [
    { src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-1.jpg`, alt: "Huzhou part 1" },
    { src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-2.jpg`, alt: "Huzhou part 2" },
    { src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-3.jpg`, alt: "Huzhou part 3" },
    { src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-4.jpg`, alt: "Huzhou part 4" },
  ],
  // 省略 rows：默认 [0,1,2,3] 放一行
}
```

**示例 B：6 张图分两行，最后一行 2 张**
```ts
{
  layout: "multiRow",
  images: [
    { src: `${R2}/images/xxx/part-1.jpg`, alt: "" }, // 下标 0
    { src: `${R2}/images/xxx/part-2.jpg`, alt: "" }, // 下标 1
    { src: `${R2}/images/xxx/part-3.jpg`, alt: "" }, // 下标 2
    { src: `${R2}/images/xxx/part-4.jpg`, alt: "" }, // 下标 3
    { src: `${R2}/images/xxx/part-5.jpg`, alt: "" }, // 下标 4
    { src: `${R2}/images/xxx/part-6.jpg`, alt: "" }, // 下标 5
  ],
  rows: [
    [0, 1, 2, 3],  // 第一行：前四张
    [4, 5],        // 第二行：后两张（宽度按比例仍顶满整行）
  ],
  description: "Line 1\nLine 2\nLine 3 (空行分隔自动转 <br>)",
}
```

**宽度分配规则（每行内部）：**
```
容器可用宽度 W = 主内容容器宽度 − (本行列数 − 1) × 24
每张图宽高比 ri = img.naturalWidth / img.naturalHeight
第 i 张宽度 wi = (ri / Σr) × W
第 i 张高度 hi = wi / ri
→ 所有图 hi 相同，底部对齐，总宽恰好等于 W
行间距 = 24px（GAP）
```

---

### 2. `"row"`（单行为宽度优先，等价于 multiRow 省略 rows）

```ts
{
  layout: "row",
  images: [img0, img1, img2, img3],
}
```

---

### 3. `"grid"` ⭐ 通用单行布局（支持 per-image hover 蒙版 caption，替代原 rowCaption）

**适用场景：** 单行多图，按比例分配宽度，可选择是否给每张图加 caption；是默认回退布局（未显式指定 layout 且 `images.length > 1` 时走此模板）。

**caption 显示规则：**
- 图片写了 `caption`（非空字符串）：鼠标 hover 进入图片区域 → **图片显示 50% 黑色蒙版**，caption 以**白色 10px serif 文字显示在图片中心**（`text-align: center`，左右各 12px 内边距）；移开鼠标即恢复原图。
- 图片没写 `caption`（或为空字符串）：纯图片，不触发任何 hover 蒙版效果。
- **所有图容器高度统一 50vh**（不再区分 80vh/50vh，也不物理预留底部空间，所有图片视觉等高）。
- `caption` 内的 **`|` 竖线字符等价于换行符 `\n`**（都能强制换行），例如 `前排 | 2025, Foshan` 会被渲染为两行：`前排` 在上，`2025, Foshan` 在下。
- `description`（整页描述）始终显示在整行下方，**和 caption 是否存在无关**。

**示例 A：纯图片无 caption（高度 50vh，hover 无效果）**
```ts
{
  layout: "grid",
  images: [img0, img1, img2, img3],
  // 可选：description: "显示在所有图片下方"
}
```

**示例 B：部分图带 caption（高度 50vh，hover 对应图时蒙版显示）**
```ts
{
  // layout: "grid" — 也可以写 "rowCaption"，两者效果完全一致（向后兼容）
  layout: "grid",
  images: [
    { src: `${R2}/.../part-6.png`,
      alt: "Foshan part 6",
      caption: "绘画作品从合作者处征集 | the paintings collected from collaborators" },
    { src: `${R2}/.../part-7.jpg`, alt: "Foshan part 7" }, // 没 caption：纯图片，hover 无反应
  ],
}
```

> 注：`layout` 值写 `"grid"` 或 `"rowCaption"` **现在效果完全相同**。建议新数据写 `"grid"`，老数据保留 `"rowCaption"` 也不受影响。

---

### 4. `"single"`（单图 + 描述）

```ts
{
  layout: "single",
  images: [
    { src: `${R2}/.../detail.jpg`, alt: "detail" },
  ],
  description: "作品细节说明（10px / 16pt / serif）",
}
```

---

### 5. `"stackedRight"`（右侧大图 + 左侧两图上下叠放 + 底部描述）

```ts
{
  layout: "stackedRight",
  images: [imgLeftTop, imgLeftBottom, imgRight], // 3 张
  description: "描述文本（显示在整个附页下方）",
}
```

---

### 6. `"textLeftStackedRight"`（左描述文本 + 中间两图上下 + 右大图）

```ts
{
  layout: "textLeftStackedRight",
  images: [imgLeftTop, imgLeftBottom, imgRightBig], // 3 张
  description: "描述文本（放在 3 栏下方单独一行，左对齐）",
}
```

---

### 7. `"fiveImageStack"`（5 图 + 叠化动效）

- 5 张图按 `images = [part1, part3, part2, part4, part5]` 顺序传入
- 中间是 part-3，左列 top=part-1 / bottom=part-2，右列 top=part-4 / bottom=part-5
- 点击中间图片 → 5 张图叠化到中央（50% 不透明，30% 宽度，居中）

```ts
{
  layout: "fiveImageStack",
  images: [
    { src: `${R2}/.../part-1.jpg`, alt: "left top" },       // images[0]
    { src: `${R2}/.../part-3.jpg`, alt: "center" },         // images[1] ← 被点击
    { src: `${R2}/.../part-2.jpg`, alt: "left bottom" },    // images[2]
    { src: `${R2}/.../part-4.jpg`, alt: "right top" },      // images[3]
    { src: `${R2}/.../part-5.jpg`, alt: "right bottom" },   // images[4]
  ],
}
```

---

### 8. `"leftMainRightStacked"`（左图+描述 / 右上大图 + 右下若干张行）⭐

**图片顺序约定：**
| 下标 | 位置 | 说明 |
|-----|------|------|
| `images[0]` | 左侧主图 | 下方可选 description（独立向下延伸，不影响右栏对齐） |
| `images[1]` | 右栏顶部大图 | 与左侧主图**严格等高**，宽度根据宽高比自适应 |
| `images[2..N]` | 右栏底部一行 | **若干张（≥0，任意数量均可，不再限制 3 张）**，所有图等高，且该行总宽度 = 右上大图宽度 |

**桌面端布局约束（严格满足）：**
1. **等高约束 A**：`height(images[0]) == height(images[1]) = H_top` → 在等高约束下两者按各自宽高比自适应宽度 `W0` 和 `W1`，`W0 + GAP + W1 = 容器整宽`。
2. **等高约束 B**：`images[2..N]` 所有图等高 `H_bottom`，且它们的宽度之和 `ΣWi + (N-3)×GAP == W1`（右下一行总宽度恰好等于右上大图宽度，右栏左右边缘平齐）。

```
桌面端视觉（以右下 3 张为例，实际支持任意张）：
┌─────────────────┐  GAP  ┌──────────────────────┐
│                 │  24px │   images[1]（右上大图） │
│   images[0]     │       │       W1 × H_top      │
│  左图 W0 × H_top │       └──────────────────────┘
│                 │        GAP
│                 │       ┌─────┬──────┬─────────┐ ← 总宽恰好 = W1
└─────────────────┘       │img2 │ img3 │  img4   │  ← 3 张等高 H_bottom
┌─────────────────┐       │等高 │ 等高 │  等高   │     宽度按比例分配
│ description文本 │       └─────┴──────┴─────────┘
└─────────────────┘
```

**示例 A：经典 5 张（左 1 + 右上 1 + 右下 3）**
```ts
{
  layout: "leftMainRightStacked",
  images: [
    imgLeftMain,         // [0] 左图
    imgRightBig,         // [1] 右上大图
    imgRightDetail1,     // [2] 右下第 1 张
    imgRightDetail2,     // [3] 右下第 2 张
    imgRightDetail3,     // [4] 右下第 3 张
  ],
  description: "描述文本，紧跟在左图下方（左栏内，独立延伸）",
}
```

**示例 B：只有 2 张图（左 1 + 右上 1，右下没有图）——同样支持**
```ts
{
  layout: "leftMainRightStacked",
  images: [imgLeftMain, imgRightBig], // 仅 2 张，右下区域自动隐藏
  description: "可选描述",
}
```

**示例 C：右下放 5 张细节图——支持任意数量**
```ts
{
  layout: "leftMainRightStacked",
  images: [left, topBig, d1, d2, d3, d4, d5], // [2..6] 共 5 张底部细节图
}
```

---

## 四、作品主页（首屏）模板 → 独立文档

> **作品主页（首屏）**对应的是 `Work.layout` 字段（8 种：`left/right/center/wide/partial/bottom/wideBottom/grid`），其使用说明**已独立成专门文档**，请跳转查看：

👉 **[WORK_LAYOUT_TEMPLATES.md](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/WORK_LAYOUT_TEMPLATES.md)** — 作品主页模板使用说明（5 个统一模板详细讲解 + 映射表 + 数据写法示例）

**主页模板 vs 附页模板概览（供快速区分）：**
| 维度 | 主页模板（Work.layout） | 附页模板（SubPage.layout）|
|-----|------------------------|--------------------------|
| 数据结构 | `Work.layout` / `work.thumbnail` / `work.images` | `Work.subPages[].layout` / `subPage.images[]` |
| 用途 | 进入作品页面时**首屏**显示 | 首屏之后点击 Next/Prev **翻页**显示 |
| 内容 | 必须包含 title + materials + 描述(可选) + 主图 | 只包含图片(必要) + caption/description(可选) |
| 常见实现 | SideBySide / Centered / HeroImage / GridLayout(多列网格) | Grid(单行) / MultiRow / StackedRight / FiveImageStack … |

---

## 五、约定

- 所有图片 `src` 使用 `${R2}/images/...`，勿用本地路径
- 文件名带罗马数字时使用真实字符：`ⅰ`（U+2170）、`ⅱ`（U+2171），不要写数字 `i`
- 间距统一使用常量 `GAP = 24px`（在子组件内通过 `import { GAP } from "@/lib/gallery-config"` 引用）
- 文本字体：标题 `serif` 18px，材料 `monospace` 12px/16pt 右对齐，描述 `serif` 10px/16pt
