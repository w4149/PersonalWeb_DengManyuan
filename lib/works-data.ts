export type Work = {
  slug: string;
  title: string;
  displayTitle?: string;
  thumbnail: string;
  aspectRatio: number;
  description?: string;
};

export type WorkCategory = {
  slug: string;
  title: string;
  coverImage: string;
  coverAspectRatio: number;
  years: number[];
  worksByYear?: Record<number, Work[]>;
  layoutByYear?: Record<number, number[]>;
};

const BLANK = "/images/blank.svg";

const R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev";

export const workCategories: WorkCategory[] = [
  {
    slug: "paintings",
    title: "Paintings",
    coverImage: `${R2}/images/paintings-2026/world-tree.jpg`,
    coverAspectRatio: 0.5771,
    years: [2026, 2025, 2024],
    layoutByYear: {
      2026: [3, 2],
      2025: [3, 3, 3],
      2024: [1, 2, 3],
    },
    worksByYear: {
      2026: [
        {
          slug: "tree-pulse",
          title: "Tree Pulse",
          displayTitle: "Tree Pulse",
          thumbnail: `${R2}/images/paintings-2026/tree-pulse.jpg`,
          aspectRatio: 0.7908,
        },
        {
          slug: "world-tree",
          title: "World Tree",
          displayTitle: "World Tree",
          thumbnail: `${R2}/images/paintings-2026/world-tree.jpg`,
          aspectRatio: 0.5771,
        },
        {
          slug: "becoming-mountain",
          title: "Becoming Mountain",
          displayTitle: "Becoming Mountain",
          thumbnail: `${R2}/images/paintings-2026/becoming-mountain.jpg`,
          aspectRatio: 0.6371,
        },
        {
          slug: "worlding",
          title: "Worlding",
          displayTitle: "Worlding",
          thumbnail: `${R2}/images/paintings-2026/worlding.jpg`,
          aspectRatio: 1.8887,
        },
        {
          slug: "the-mountain-of-spirits",
          title: "The Mountain of Spirits",
          displayTitle: "The Mountain of Spirits",
          thumbnail: `${R2}/images/paintings-2026/the-mountain-of-spirits.jpg`,
          aspectRatio: 1.3517,
        },
      ],
      2025: [
        {
          slug: "a-joke-on-fragmented-shan-shui",
          title: "A Joke on Fragmented Shan Shui Ⅰ~Ⅹ",
          displayTitle: "A Joke on Fragmented Shan Shui Ⅰ~Ⅹ",
          thumbnail:
            "/images/paintings-2025/a-joke-on-fragmented-shan-shui/dsc02784.jpg",
          aspectRatio: 1.0336,
        },
        {
          slug: "becoming-human",
          title: "Becoming Human Ⅰ Ⅱ Ⅲ",
          displayTitle: "Becoming Human Ⅰ Ⅱ Ⅲ",
          thumbnail:
            "/images/paintings-2025/becoming-human/contact-sheet-1.jpg",
          aspectRatio: 1.1756,
        },
        {
          slug: "floating",
          title: "Floating",
          displayTitle: "Floating",
          thumbnail: "/images/paintings-2025/floating.jpg",
          aspectRatio: 0.692,
        },
        {
          slug: "maternity-myth",
          title: "Maternity Myth",
          displayTitle: "Maternity Myth",
          thumbnail: "/images/paintings-2025/maternity-myth.png",
          aspectRatio: 1.2081,
        },
        {
          slug: "rock-and-tree-i",
          title: "Rock and Tree Ⅰ",
          displayTitle: "Rock and Tree Ⅰ",
          thumbnail: "/images/paintings-2025/rock-and-tree-ⅰ.png",
          aspectRatio: 1.011,
        },
        {
          slug: "rock-and-tree-ii",
          title: "Rock and Tree Ⅱ",
          displayTitle: "Rock and Tree Ⅱ",
          thumbnail: "/images/paintings-2025/rock-and-tree-ⅱ.png",
          aspectRatio: 1.0044,
        },
        {
          slug: "sinking",
          title: "Sinking",
          displayTitle: "Sinking",
          thumbnail: "/images/paintings-2025/sinking.jpg",
          aspectRatio: 1.2281,
        },
        {
          slug: "tree-spirit",
          title: "Tree Spirit Ⅰ Ⅱ Ⅲ",
          displayTitle: "Tree Spirit Ⅰ Ⅱ Ⅲ",
          thumbnail:
            "/images/paintings-2025/tree-spirit/collected.png",
          aspectRatio: 1.1099,
        },
        {
          slug: "wildmans-paradise",
          title: "Wildman's Paradise",
          displayTitle: "Wildman's Paradise",
          thumbnail:
            "/images/paintings-2025/wildmans-paradise.jpg",
          aspectRatio: 0.7874,
        },
      ],
      2024: [
        {
          slug: "fragments-of-memory",
          title: "Fragments of Memory",
          displayTitle: "Fragments of Memory",
          thumbnail:
            "/images/paintings-2024/fragments-of-memory/collaged-landscape-scroll.png",
          aspectRatio: 12.1744,
        },
        {
          slug: "bapo-shanshui",
          title: "Bapo Shanshui",
          displayTitle: "Bapo Shanshui",
          thumbnail: "/images/paintings-2024/bapo-shanshui.jpg",
          aspectRatio: 1.3552,
        },
        {
          slug: "collaged-love",
          title: "Collaged Love",
          displayTitle: "Collaged Love",
          thumbnail: "/images/paintings-2024/collaged-love.png",
          aspectRatio: 1.3862,
        },
        {
          slug: "non-dualism",
          title: "Non-Dualism",
          displayTitle: "Non-Dualism",
          thumbnail: "/images/paintings-2024/non-dualism.jpg",
          aspectRatio: 1.5,
        },
        {
          slug: "sacred-sapling",
          title: "Sacred Sapling",
          displayTitle: "Sacred Sapling",
          thumbnail: "/images/paintings-2024/sacred-sapling.jpg",
          aspectRatio: 0.9865,
        },
        {
          slug: "verdant-heaven",
          title: "Verdant Heaven",
          displayTitle: "Verdant Heaven",
          thumbnail: "/images/paintings-2024/verdant-heaven.jpg",
          aspectRatio: 0.6975,
        },
      ],
    },
  },
  {
    slug: "installations",
    title: "Installations",
    coverImage:
      "/images/installations-2026/weishan-memory-i/main.png",
    coverAspectRatio: 1.7769,
    years: [2026, 2025],
    layoutByYear: {
      2026: [3],
      2025: [2, 2],
    },
    worksByYear: {
      2026: [
        {
          slug: "god-of-happiness",
          title: "God of Happiness",
          displayTitle: "God of Happiness",
          thumbnail:
            "/images/installations-2026/god-of-happiness/main-1.jpg",
          aspectRatio: 1.8293,
        },
        {
          slug: "weishan-memory-i",
          title: "Weishan Memory Ⅰ",
          displayTitle: "Weishan Memory Ⅰ",
          thumbnail:
            "/images/installations-2026/weishan-memory-i/main.png",
          aspectRatio: 1.7769,
        },
        {
          slug: "weishan-memory-ii",
          title: "Weishan Memory Ⅱ",
          displayTitle: "Weishan Memory Ⅱ",
          thumbnail:
            "/images/installations-2026/weishan-memory-ii/detail-1.jpg",
          aspectRatio: 0.6283,
        },
      ],
      2025: [
        {
          slug: "memory-nearby-chengdu",
          title: "Memory Nearby-Chengdu",
          displayTitle: "Memory Nearby-Chengdu",
          thumbnail:
            "/images/installations-2025/memory-nearby/chengdu-version/full.jpg",
          aspectRatio: 1.0,
        },
        {
          slug: "memory-nearby-huzhou",
          title: "Memory Nearby-Huzhou",
          displayTitle: "Memory Nearby-Huzhou",
          thumbnail:
            "/images/installations-2025/memory-nearby/chengdu-version/full.jpg",
          aspectRatio: 1.0,
        },
        {
          slug: "new-narrative-of-foshan",
          title: "New Narrative of Foshan",
          displayTitle: "New Narrative of Foshan",
          thumbnail:
            "/images/installations-2025/new-narrative-of-foshan/main.png",
          aspectRatio: 1.7769,
        },
        {
          slug: "spirit-dwelling",
          title: "Spirit Dwelling",
          displayTitle: "Spirit Dwelling",
          thumbnail:
            "/images/installations-2025/spirit-dwelling/detail-1.jpg",
          aspectRatio: 0.6035,
        },
      ],
    },
  },
  {
    slug: "workshops",
    title: "Workshops",
    coverImage:
      "/images/workshops-2026/weishan-memory-collage-workshop/main.jpg",
    coverAspectRatio: 1.3654,
    years: [2026, 2025],
    layoutByYear: {
      2026: [1],
      2025: [1],
    },
    worksByYear: {
      2026: [
        {
          slug: "weishan-memory-collage-workshop",
          title: "Weishan Memory Collage Workshop",
          displayTitle: "Weishan Memory Collage Workshop",
          thumbnail:
            "/images/workshops-2026/weishan-memory-collage-workshop/main.jpg",
          aspectRatio: 1.3654,
        },
      ],
      2025: [
        {
          slug: "the-memory-ritual-of-leaves-and-trees",
          title: "The Memory Ritual of Leaves and Trees",
          displayTitle: "the Memory Ritual of Leaves and Trees",
          thumbnail:
            "/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/main.jpg",
          aspectRatio: 1.7768,
        },
      ],
    },
  },
  {
    slug: "photograph-videos",
    title: "Photograph & Videos",
    coverImage:
      "/images/photograph-videos-2026/photograph/animism-1.jpg",
    coverAspectRatio: 1.7778,
    years: [2026],
    layoutByYear: {
      2026: [2, 1],
    },
    worksByYear: {
      2026: [
        {
          slug: "a-wedding-within-shan-shui",
          title: "A Wedding within Shan Shui that day, the sum of every moment",
          displayTitle: "A Wedding within Shan Shui that day, the sum of every moment",
          thumbnail:
            "/images/photograph-videos-2026/video/a-wedding-within-shan-shui.png",
          aspectRatio: 2.1884,
        },
        {
          slug: "embodied-memories-of-weishan",
          title: "Embodied Memories of Weishan",
          displayTitle: "Embodied Memories of Weishan",
          thumbnail:
            "/images/photograph-videos-2026/video/embodied-memories-of-weishan.jpg",
          aspectRatio: 1.7787,
        },
        {
          slug: "animism",
          title: "Animism",
          displayTitle: "Animism",
          thumbnail:
            "/images/photograph-videos-2026/photograph/animism-1.jpg",
          aspectRatio: 1.7778,
        },
      ],
    },
  },
];

export function getCategory(slug: string): WorkCategory | undefined {
  return workCategories.find((c) => c.slug === slug);
}

export function getWorksByYear(
  categorySlug: string,
  year: number
): Work[] | undefined {
  const category = getCategory(categorySlug);
  if (!category?.worksByYear) return undefined;
  return category.worksByYear[year];
}

export function getWork(
  categorySlug: string,
  year: number,
  workSlug: string
): Work | undefined {
  const works = getWorksByYear(categorySlug, year);
  if (!works) return undefined;
  return works.find((w) => w.slug === workSlug);
}

export function getLayoutForYear(
  categorySlug: string,
  year: number
): number[] | undefined {
  const category = getCategory(categorySlug);
  if (!category?.layoutByYear) return undefined;
  return category.layoutByYear[year];
}

export { BLANK };
