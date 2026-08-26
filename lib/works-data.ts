export type Work = {
  slug: string;
  title: string;
  thumbnail: string;
  description?: string;
};

export type WorkCategory = {
  slug: string;
  title: string;
  coverImage: string;
  years: number[];
  worksByYear?: Record<number, Work[]>;
};

const BLANK = "/images/blank.svg";

export const workCategories: WorkCategory[] = [
  {
    slug: "paintings",
    title: "Paitings",
    coverImage: "/images/1.paitings-2026/Tree Pulse.jpg",
    years: [2026, 2025, 2024],
    worksByYear: {
      2026: [
        {
          slug: "tree-pulse",
          title: "Tree Pulse",
          thumbnail: "/images/1.paitings-2026/Tree Pulse.jpg",
        },
        {
          slug: "world-tree",
          title: "World Tree",
          thumbnail: "/images/1.paitings-2026/Word Tree.jpg",
        },
        {
          slug: "becoming-mountain",
          title: "Becoming Mountain",
          thumbnail: "/images/1.paitings-2026/Becoming Mountain.jpg",
        },
        {
          slug: "worlding",
          title: "Worlding",
          thumbnail: "/images/1.paitings-2026/Worlding.jpg",
        },
        {
          slug: "the-mountain-of-spirits",
          title: "The Mountain of Spirits",
          thumbnail: "/images/1.paitings-2026/the mountain of spirits.jpg",
        },
      ],
      2025: [
        {
          slug: "a-joke-on-fragmented-shan-shui",
          title: "A Joke on Fragmented Shan Shui Ⅰ~Ⅹ",
          thumbnail:
            "/images/2.paitings-2025/A Joke on Fragmented Shan Shui Ⅰ~Ⅹ/DSC02784.jpg",
        },
        {
          slug: "becoming-human",
          title: "Becoming Human Ⅰ Ⅱ Ⅲ",
          thumbnail:
            "/images/2.paitings-2025/Becoming  Human Ⅰ Ⅱ Ⅲ/主图1.jpg",
        },
        {
          slug: "floating",
          title: "Floating",
          thumbnail: "/images/2.paitings-2025/Floating.JPG",
        },
        {
          slug: "maternity-myth",
          title: "Maternity Myth",
          thumbnail: "/images/2.paitings-2025/Maternity Myth.png",
        },
        {
          slug: "rock-and-tree-i",
          title: "Rock and Tree Ⅰ",
          thumbnail: "/images/2.paitings-2025/Rock and Tree Ⅰ.png",
        },
        {
          slug: "rock-and-tree-ii",
          title: "Rock and Tree Ⅱ",
          thumbnail: "/images/2.paitings-2025/Rock and TreeⅡ.png",
        },
        {
          slug: "sinking",
          title: "Sinking",
          thumbnail: "/images/2.paitings-2025/Sinking.jpg",
        },
        {
          slug: "tree-spirit",
          title: "Tree Spirit Ⅰ Ⅱ Ⅲ",
          thumbnail:
            "/images/2.paitings-2025/Tree Spirit Ⅰ Ⅱ Ⅲ/总.png",
        },
        {
          slug: "wildmans-paradise",
          title: "Wildman's Paradise",
          thumbnail:
            "/images/2.paitings-2025/Wildman's Paradise.jpg",
        },
      ],
      2024: [
        {
          slug: "bapo-shanshui",
          title: "Bapo Shanshui",
          thumbnail: "/images/3.paitings-2024/Bapo Shanshui.jpg",
        },
        {
          slug: "collaged-love",
          title: "Collaged Love",
          thumbnail: "/images/3.paitings-2024/Collaged Love.png",
        },
        {
          slug: "fragments-of-memory",
          title: "Fragments of Memory",
          thumbnail:
            "/images/3.paitings-2024/Fragments of Memory/拼贴山水长卷.png",
        },
        {
          slug: "non-dualism",
          title: "Non-Dualism",
          thumbnail: "/images/3.paitings-2024/Non-Dualism.jpg",
        },
        {
          slug: "sacred-sapling",
          title: "Sacred Sapling",
          thumbnail: "/images/3.paitings-2024/Sacred Sapling.jpg",
        },
        {
          slug: "verdant-heaven",
          title: "Verdant Heaven",
          thumbnail: "/images/3.paitings-2024/Verdant Heaven.jpg",
        },
      ],
    },
  },
  {
    slug: "installations",
    title: "Installations",
    coverImage: "/images/4.installations-2026/Weishan Memory Ⅰ/主图.png",
    years: [2026, 2025],
    worksByYear: {
      2026: [
        {
          slug: "god-of-happiness",
          title: "God of Happiness",
          thumbnail:
            "/images/4.installations-2026/God of  Happiness/主图1.jpg",
        },
        {
          slug: "weishan-memory-i",
          title: "Weishan Memory Ⅰ",
          thumbnail:
            "/images/4.installations-2026/Weishan Memory Ⅰ/主图.png",
        },
        {
          slug: "weishan-memory-ii",
          title: "Weishan Memory Ⅱ",
          thumbnail:
            "/images/4.installations-2026/Weishan Memory Ⅱ/主图.jpg",
        },
      ],
      2025: [
        {
          slug: "memory-nearby",
          title: "Memory Nearby",
          thumbnail:
            "/images/5.installations-2025/Memory Nearby/Chengdu version/全.jpg",
        },
        {
          slug: "new-narrative-of-foshan",
          title: "New Narrative of Foshan",
          thumbnail:
            "/images/5.installations-2025/New Narrative of Foshan/主图.png",
        },
        {
          slug: "spirit-dwelling",
          title: "Spirit Dwelling",
          thumbnail:
            "/images/5.installations-2025/Spirit Dwelling/主图.jpg",
        },
      ],
    },
  },
  {
    slug: "workshops",
    title: "Workshops",
    coverImage:
      "/images/6.workshops-2026/Weishan Memory Collage Workshop/主图.png",
    years: [2026, 2025],
    worksByYear: {
      2026: [
        {
          slug: "weishan-memory-collage-workshop",
          title: "Weishan Memory Collage Workshop",
          thumbnail:
            "/images/6.workshops-2026/Weishan Memory Collage Workshop/主图.png",
        },
      ],
      2025: [
        {
          slug: "the-memory-ritual-of-leaves-and-trees",
          title: "The Memory Ritual of Leaves and Trees",
          thumbnail:
            "/images/7.workshops-2025/the Memory Ritual of Leaves and Trees/主图.jpg",
        },
      ],
    },
  },
  {
    slug: "photograph-videos",
    title: "Photograph & Videos",
    coverImage:
      "/images/8.Photograph and videos-2026/Photograph/animism (1).jpg",
    years: [2026],
    worksByYear: {
      2026: [
        {
          slug: "animism",
          title: "animism",
          thumbnail:
            "/images/8.Photograph and videos-2026/Photograph/animism (1).jpg",
        },
        {
          slug: "a-wedding-within-shan-shui",
          title: "A Wedding within Shan Shui",
          thumbnail:
            "/images/8.Photograph and videos-2026/vedio/A Wedding within Shan Shui-that day, the sum of every moment.png",
        },
        {
          slug: "embodied-memories-of-weishan",
          title: "Embodied Memories of Weishan",
          thumbnail:
            "/images/8.Photograph and videos-2026/vedio/Embodied Memories of Weishan.jpg",
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

export { BLANK };
