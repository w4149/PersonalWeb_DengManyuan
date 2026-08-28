# SubPage 附页模板使用说明（2026-08-28 快照）

适用于 `lib/works-data.ts` 中每个作品的 `subPages?: SubPage[]` 字段。所有附页共享：

- 图片：**一律用 `<SafeImg>` 三级容错**（原图 → 作品 `work.thumbnail` → 内联 SVG 灰块兜底，见下文 §1.2）。
- 响应式：桌面端复杂拼贴 / 双栏 / 同行等高；**移动端 <768px 统一降级为纵向堆叠**（每张 `w-full / h-auto / maxHeight 60vh`，顺序 = `images[]` 下标顺序），无需手动写移动分支。
- caption 规格：per-image `image.caption` 写在**图底永久显示**（mt-2 / 10px / opacity 0.5 / text-center / 深灰），与 WORKS 分类画廊、主页 heroCaption 三套**样式完全统一**（§0.3 对照表）。

---

## §0. 关键概念速查（2026-08 新增）

### §0.1 三套图片路径体系（thumbnail vs cover vs subPage images）

```
R2 = https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev

/images/{category}-{year}/
├── works/          ← WORKS 一级分类卡片（/works 顶层 4 分类）封面：paintings.jpg / installations.jpg / workshops.jpg / photograph_and_videos.jpg
│
├── paintings-2024/
│   ├── covers/                              ← 【分类画廊专用缩略图】
│   │   ├── sacred-sapling.jpg               ← 文件名 = 作品 slug（注意 R2 名单/双 p 与 slug 差异以 R2 实际文件名为准）
│   │   ├── fragments-of-memory.png
│   │   └── ...
│   └── {slug}/                              ← 【作品详情图】
│       ├── main-1.jpg                       ← work.thumbnail（详情主页图，SafeImg 第 1 层 fallback）
│       ├── part-1.jpg / part-2.jpg ...      ← subPage images[]（附页组图）
│       └── (main-2.jpg / main-3.jpg)        ← 仅 HeroImageMultiRow 作品（如 Becoming Human ⅠⅡⅢ 三张主图）有
│
├── installations-2025/covers/...
├── workshops-2026/covers/...
└── photograph-videos-2026/covers/...
```

- **work.thumbnail**（详情页主图）= `/images/{cat}-{yr}/{slug}/main-1.{jpg|png}`。**所有作品必填**。
- **work.cover**（分类画廊缩略图）= `/images/{cat}-{yr}/covers/{slug}.{jpg|png}`。**有则优先**，无则自动回退到 thumbnail（但分类画廊 justified 等高校准会用 `coverAspectRatio` 做首屏比例，没填 cover 时会用 thumbnail 比例做降级首屏）。
- **subPage images[]**（附页）= **同一**作品目录下的 `/part-N.jpg/png/jpg`。

> **新增/替换作品 Checklist（避免出错）：**
> 1. 在 `{cat}-{yr}/{slug}/` 放 main-1（jpg/png 看 R2）。
> 2. 在 `{cat}-{yr}/covers/` 放同 slug 同名封面图（扩展名根据实际上传）。
> 3. 如果 `cover` 比例和 `main-1` 不一样，填 `coverAspectRatio` 消除首屏跳动。

### §0.2 三种「caption 样式写法完全相同，但归属层不要混淆」

| 字段 | 谁写？ | 展示位置 | 样式（完全一致） |
|------|--------|---------|------------------|
| `work.heroCaption`       | Work（主页）| 主图（thumbnail 或 HeroImageMultiRow 整行）**正下方** | mt-2 / 10px / text-center / text-gray-700 / opacity 0.5 |
| `image.caption` (GridLayout 主页) | Work.images[] 每格 | 网格每张图**图底** | 同上 |
| `image.caption` (SubPage) | SubPage.images[] 每张 | 附页每张图**图底** | 同上 |
| `subPage.description` | SubPage | 附页整体下方整段文字 | 10px serif / 16pt 行距 / text-gray-700 / text-left（描述是段落不是图注） |
| `work.description` | Work（主页）| 主页图下方，宽度与图片对齐（HeroImageLayout: 描述块 75% 宽 + text-left） | 10px serif / 16pt 行距 / text-left |

> `|` 或 `\n` 都等价于 `<br>` 强制换行，`\n\n` 则是更明显的双换行段落分隔（描述用）。

### §0.3 分类画廊 JustifiedGallery 的 3 级容错 + 比例来源链路

```
分类画廊渲染作品（WORKS → Paintings → 2025 这种页面）：
  1) 图 src = work.cover ?? work.thumbnail
  2) 有 cover → onError 自动 fallback 到 thumbnail（<img onError>），URL 错/ORB/404 都不裂图
  3) 首屏 ratio = coverAspectRatio（填了 cover 时填它！），否则 aspectRatio 降级
  4) 图片 onLoad 后测量 natural dims → 重算 rows（消除首屏"盒子等高、内容不等高"）
```
实现：
- `app/works/[category]/[year]/page.tsx` 提供 `src + fallbackSrc`；
- `components/justified-gallery.tsx` 里 `erroredIndices Set` + `onError` 切换；
- `components/category-gallery.tsx`（WORKS 顶层 4 分类卡片）同样的 onLoad dims 校准 + 归一化 scale。

---

## 一、通用结构

```ts
import type { SubPage } from "@/lib/works-data";

const subPage: SubPage = {
  layout: "...",          // 模板类型，见下文总览表
  images: [               // 该附页要用到的所有图片
    { src: `${R2}/images/.../part-1.jpg`, alt: "说明文字（可选）" },
    { src: `${R2}/images/.../part-2.jpg`, alt: "说明文字（可选）",
      caption: "图注（grid / sevenSplit / multiRow 等支持 per-image caption）——显示在图片下方，紧贴图底 mt-2，10px，深灰文字，opacity 0.5。\n或 | 都能强制换行" },
  ],
  description: "整页描述文本（可选，大多数模板支持）",
  rows: [[0, 1], [2, 3]], // 仅 multiRow 生效，控制每行放哪几张图
  // ====== 仅 sevenSplit 生效（均为可选字段，见下文默认值）======
  splitRatio: [2, 3],    // 左右栏宽度比（例：[2,3] → 左 40% / 右 60%；[1,1] → 各一半）
  topRightCount: 3,      // 右上"一行"里放几张（默认 3，同行等高，总宽顶满右栏）
  leftBottomCount: 2,    // 左下"一行"里放几张（默认 2，同行等高，总宽顶满左栏）
  // ====== 定制 becomingHumanCollage5（无可调字段，图片严格 5 张 row1=2 张 row2=3 张）======
  // 无需其它字段，仅 layout: "becomingHumanCollage5" + images 长度 = 5
};
```

图片路径前缀：
```ts
import { R2 } from "@/lib/works-data";
// R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev"
```

---

## 二、所有模板清单

| layout 名称                     | 含义                                                                                                                                                | description | 每行独立配置 | 可调字段（非 sevenSplit/定制留空）       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ | ----------------------------------------- |
| `"grid"`                        | **通用单行宽度优先布局** ⭐（默认回退）：per-image **图底永久显示 caption**（\|/\n 换行）+ 整页描述                                                 | 支持        | 无           | —                                         |
| `"single"`                      | 单张图 + 下方描述                                                                                                                                   | 支持        | 无           | —                                         |
| `"stackedRight"`                | 右图大 + 左列两小张上下叠放 + 底部描述                                                                                                               | 支持        | 无           | —                                         |
| `"textLeftStackedRight"`        | 左栏描述文本 + 中间两图上下 + 右栏大图                                                                                                               | 支持        | 无           | —                                         |
| `"fiveImageStack"`              | 左中右三栏 5 图 + 点击中图叠化动效                                                                                                                 | 不支持      | 无           | —                                         |
| `"row"`                         | **单行**宽度优先：等高度按比例分配宽度，底部对齐                                                                                                    | 不支持      | 无           | —                                         |
| `"multiRow"`                    | **若干行**宽度优先，每行任意张数，可选底部整页描述 ⭐ 推荐                                                                                           | 支持        | `rows` 字段  | —                                         |
| `"leftMainRightStacked"`        | 左图（下接描述）+ 右图上大图 + 右下图若干张一行                                                                                                       | 支持        | 无           | —                                         |
| `"sevenSplit"`                  | ⭐ **双栏海报式排版**（可调宽比 / 可调每组数量）：左上大图 / 右上 N 张同行 / 右下大图 / 左下 M 张同行；外层 `items-stretch` 严格等高 + justify-between 四角对齐 | 支持 | `splitRatio` / `topRightCount` / `leftBottomCount` |
| `"becomingHumanCollage5"`       | ⚙️ **定制：Becoming Human 第 2 附页 5 张拼贴**（Row1 2 张同行等高顶满 / Row2 3 张同行等高顶满，gap=24）                                                  | 支持        | 无           | images 长度必须=5（part-8~12）            |
| `"rowCaption"`                  | ⚠️ **已合并到 `grid`**（向后兼容，仍可用，实际走 grid 逻辑）                                                                                         | 支持 | 无 | — |

> **关于「grid」和「rowCaption」合并 + caption 显示规则重申（2026-08 已固化）：**
> - `grid` 自动检测 images 中的 caption，**有则图底永久显示**（mt-2 / 10px / opacity 0.5 / center），**无则不渲染不留白**，不再使用 hover 蒙版。
> - 桌面端图高 50vh，按比例分配宽度；移动端 `w-full h-auto maxHeight 60vh` 纵堆。
> - caption 内的 `|` 或 `\n` 都作为换行；整页 `description` 放在整行下方（不是每张图底下）。
> - 原「rowCaption」向后兼容别名（推荐新数据直接写 `"grid"`）。

---

## 三、各模板详细使用

### 1. `multiRow` ⭐（通用多行宽度优先）

**适用场景：** 需要把多张图分到多行（每行 1~N 张，按宽比例排满整行）、下方可挂描述。

**示例 A：Fragments of Memory 长卷（11 行 × 1 张 part-1~11）**
```ts
{
  layout: "multiRow",
  description: "",   // 无描述
  rows: [            // 11 行，每行 1 张 → 每张自动顶满 100% 宽
    [0], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10],
  ],
  images: [
    { src: `${R2}/images/paintings-2024/fragments-of-memory/part-1.jpg` },
    // ... part-11.jpg
  ],
}
```

**示例 B：Weishan Memory Collage Workshop 参与者作品（3 行）**
```ts
{
  layout: "multiRow",
  description: "the collage works made by participants",
  rows: [[0, 1, 2], [3, 4], [5, 6, 7]],
  images: [
    { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-1.jpg` },
    // ... part-8.jpg 共 8 张
  ],
}
```

**宽度分配 + 归一化算法（贯穿 MultiRow / Grid / JustifiedGallery / HeroImageMultiRow 全统一）：**
```
W = 容器宽 − (N−1) × 24
r_k = naturalW_k / naturalH_k（真实比例）
H = W / Σr_k（行高，严格同行等高）
w_k = r_k × H
scale = W / Σw_k   ← 归一化，保证 Σw_k 严格 = W（浮点误差 0，杜绝横向滚动条）
w_k' = w_k × scale ; H' = H × scale
```
行间距 = GAP = 24px。所有附页都走 `GAP`（`import { GAP } from "@/lib/gallery-config"`）。

---

### 2. `grid` ⭐（默认回退布局：单行宽度优先 + per-image 图底 caption）

替代原 `rowCaption`。**何时用 grid vs multiRow？**
- `grid`：只需一行（任意张）→ 用。
- `multiRow`：多行（分若干行）→ 必须写 `rows`。

**示例：New Narrative of Foshan 附页 2（两格，左图带 caption 中文+英文 | 换行，右图纯图）**
```ts
{
  layout: "grid",
  images: [
    {
      src: `${R2}/.../new-narrative-of-foshan/part-6.png`,
      caption: "绘画作品从合作者处征集 | the paintings collected from collaborators",
    },
    { src: `${R2}/.../new-narrative-of-foshan/part-7.jpg` },
  ],
}
```

---

### 3. `single`（单图 + 描述）

```ts
{
  layout: "single",
  images: [{ src: `${R2}/.../detail.jpg` }],
  description: "作品细节说明（10px / 16pt / serif）",
}
```

---

### 4. `stackedRight`（右侧大图 / 左侧两图上下叠放） & `textLeftStackedRight`（左描述 + 中图上下 / 右大图）

```ts
// stackedRight: 3 张 → 左列 2 张上下叠（gap=24）/ 右列大图；描述在整体下方
{ layout: "stackedRight", images: [imgLT, imgLB, imgRBig], description: "..." }

// textLeftStackedRight: 左栏整段描述 / 中栏 2 张上下 / 右栏大图
{ layout: "textLeftStackedRight", images: [imgMT, imgMB, imgRBig], description: "左侧整段描述（左栏垂直占满）" }
```

---

### 5. `leftMainRightStacked` ⭐（左主图 + 描述 / 右上大图 + 右下 N 张同行）

```
images[0] 左主图（等高 = 右上图）├─ gap 24 ─┤ images[1] 右上大图
左主图下方 description（独流） │           │ gap24 ← 总宽恰好 = 右上大图宽
                                │           │ images[2..N] 右下 N 张同行等高（比例分配宽度）
```
严格满足 2 条等高约束（详见 §8 原文档注释）。示例：
```ts
{
  layout: "leftMainRightStacked",
  images: [leftMain, rightBig, r1, r2, r3],   // 右下 3 张
  description: "左主图下方延伸，不影响右栏对齐",
}
```

---

### 6. `sevenSplit` ⭐ 双栏海报式排版（宽比 / 每组数量全可调）

**映射（重要！顺序不能错）：** T = topRightCount，B = leftBottomCount →
```
images[0]                    │ images[1..T]   右上 T 张同行等高（贴栏顶）
                             │ gapY = 24
gapX = 24                    │ images[T+1]   右下 1 张（贴栏底）
images[T+2..T+1+B] 左下 B 张 │
          同行等高（贴栏底） │
```

**桌面端对齐保证：**
1. 外层双栏 `items-stretch` → 两栏等高 = max(左内容, 右内容)。
2. 每栏 `justify-between` → 左上/右下分别推栏顶/底，右上同行贴栏顶、左下同行贴栏底。
3. 同行组用「比例+归一化」算法，总宽恰好 = 栏宽 − (n−1)×24。

**三示例：**
```ts
// A：经典 7 图 2:3（默认参数，可不写 splitRatio/topRightCount/leftBottomCount）
{
  layout: "sevenSplit",
  images: [L1, RT1, RT2, RT3, R1, LB1, LB2],  // length = 1+3+1+2 = 7
  description: "",
}

// B：Becoming Human 附页 1（splitRatio=1:1，仍 T=3 B=2）
{
  layout: "sevenSplit",
  splitRatio: [1, 1],
  images: [part1,part2,part3,part4,part5,part6,part7], // 仍 7 张
}

// C：非对称 5 格 1:1（T=2 B=1，1+2+1+1=5）
{
  layout: "sevenSplit",
  splitRatio: [1, 1],
  topRightCount: 2,
  leftBottomCount: 1,
  images: [L1, RT1, RT2, R1, LB1],
}
```

---

### 7. `becomingHumanCollage5` ⚙️ 定制拼贴（Becoming Human 第 2 附页）

**不写任何可调参数**，只写 `layout + images[5]`：
- Row1 = images[0,1] 两张同行等高顶满容器宽
- Row2 = images[2,3,4] 三张同行等高顶满容器宽
- gapX=gapY=24，每张有 caption，description 整页下方

```ts
// Becoming Human 实际使用（part-8 ~ part-12）
{
  layout: "becomingHumanCollage5",
  description: "",
  images: [
    { src: `${R2}/.../becoming-human/part-8.jpg` },
    { src: `${R2}/.../becoming-human/part-9.jpg` },
    { src: `${R2}/.../becoming-human/part-10.jpg` },
    { src: `${R2}/.../becoming-human/part-11.jpg` },
    { src: `${R2}/.../becoming-human/part-12.jpg` },
  ],
}
```

---

## 四、响应式 & 稳定性（移动端统一降级表）

所有模板 `window.innerWidth < 768` 时独立降级（代码：每个模板内 `useEffect(checkMobile)` 监听，ResizeObserver 作为尺寸二次校准兜底；本轮新增 SafeImg/heroCaption/hover 蒙版都写在响应式分支外，桌面移动双端共享交互）：

| SubPage.layout                | 桌面端                            | 移动端 <768px 降级行为                                                                 |
|------------------------------|-----------------------------------|--------------------------------------------------------------------------------------|
| `grid` / `row` / `single`    | 单行按比例排 / 单图               | 按 `images[]` 下标顺序纵向堆叠，每张 w-full / h-auto / maxHeight 60vh，gap=24           |
| `multiRow`                   | 多行 × 每行比例分配宽度           | 同上（每行内部也打破，全部按 0..n-1 顺序一张张叠下来）                                  |
| `leftMainRightStacked`       | 左主图+描述 / 右上+右下等高同行   | 同上                                                                                  |
| `stackedRight`               | 右大 / 左上下两小                 | 同上                                                                                  |
| `textLeftStackedRight`       | 左文本 / 中两上下 / 右大图         | 同上                                                                                  |
| `sevenSplit`                 | 双栏等高+两端组对齐               | 按"左上 → 右上同行序 → 右下 → 左下同行序"顺序堆叠                                    |
| `becomingHumanCollage5`      | Row1 两张 / Row2 三张同行等高      | images[0..4]（part-8→9→10→11→12）五张纵向堆叠                                        |
| `fiveImageStack`             | 五栏/叠化动效                      | 同 0..4 顺序堆叠                                                                      |

### 稳定性兜底（2026-08 全链路）

| 机制 | 问题 | 效果 |
|------|------|------|
| **SafeImg 三级容错**（所有 `<img>` 替换） | R2 ORB / 404 / 连接关闭 | 原图 → `work.thumbnail` (main-1) → 内联 SVG，永远不裂图 |
| **JustifiedGallery fallbackSrc**（分类画廊） | cover 错名/未传 → 画廊缩略图 404 | 自动切回 `work.thumbnail`（main-1）兜底 |
| **onLoad dims 重算行高**（所有同行等高场景 + 1 级/2 级分类画廊） | `coverAspectRatio` 未填导致首屏"img 盒等高 / 内容留白错位" | 图片加载后获取 naturalWidth/Height 精确比例，重算 rows |
| **归一化 scale** | 浮点求和误差导致 Σwidth > 容器宽 0.5px（横向滚动条） | 算完 widths 后做 scale = W/Σwidth，重校准到精确 = W（0 误差） |

---

## 五、作品主页模板文档（另一份）

`Work.layout`（8 种：`left/right/center/wide/partial/bottom/wideBottom/grid`）的文档在：

👉 **[WORK_LAYOUT_TEMPLATES.md](file:///d:/Trae_Code/Project/DengManyuan_PersonalWeb/WORK_LAYOUT_TEMPLATES.md)**

两者快速区分：
| 维度 | 主页模板（Work.layout） | 附页模板（SubPage.layout） |
|-----|------------------------|--------------------------|
| 字段 | `work.layout` / `work.thumbnail` / `work.images` | `work.subPages[].layout` / `subPage.images[]` |
| 路由 | 进入作品首屏 | 首屏后 Next/Prev 翻页 |
| 内容 | 必含 title / materials / description(可选) / hero(含 heroLink/heroCaption 可选外链跳转 + hover 灰色蒙版) | 只含 images + caption(可选) + description(可选) |
| 常见实现 | SideBySide / Centered / HeroImage / GridLayout(多列网格) | Grid(单行) / MultiRow / SevenSplit / becomingHumanCollage5 … |

---

## 六、全局约定

- 图片路径一律 `${R2}/images/...`（R2 CDN 前缀），**不要本地路径**，不要相对路径。
- 罗马数字文件名用 Unicode：`ⅰ` / `ⅱ` / `ⅰ-ⅱ`（U+2170/2171），**不要用字母 i/ii**。
- 封面 slug 以 **R2 实际文件名单 p/双 p 拼写**为准（例：Paintings 2024 sacred-sapling.jpg 单 p，但作品 slug 是 sacred-sa**pp**ling）。
- 间距常量 `GAP = 24px`（`lib/gallery-config.ts`），不要手写 24 当常量分散。
- **写 `works-data.ts` 后必跑 `npx tsc --noEmit`**（TypeScript 零错误才算完成）。
