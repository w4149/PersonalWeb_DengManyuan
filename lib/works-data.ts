export type Work = {
  slug: string;
  title: string;
  displayTitle?: string;
  thumbnail: string;
  aspectRatio: number;
  description?: string;
  materials?: string;
  layout?: "left" | "center" | "wide" | "partial" | "right" | "bottom" | "wideBottom" | "grid";
  imgWidthRatio?: number;
  link?: string;
  images?: { src: string; alt?: string }[];
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
          materials: "acrylic painting on paper, 27×35cm, 2026",
          layout: "left",
          description:
            "This work depicts the internal structure of a tree, focusing on its growth, and energy flow. Moving beyond external morphology, the painting seeks to enter the tree's inner vital processes, exploring the possibility of shared embodiment—a mutual life rhythm between humans and trees.",
        },
        {
          slug: "world-tree",
          title: "World Tree",
          displayTitle: "World Tree",
          thumbnail: `${R2}/images/paintings-2026/world-tree.jpg`,
          aspectRatio: 0.5771,
          materials: "acrylic painting on canvas, 60×100cm, 2026",
          layout: "center",
          description:
            "The World Tree stands as a cosmic axis connecting heaven and earth, its branches reaching into the spiritual realm while its roots grip the material world. Birds nest in its crown, symbolizing the communion between the mortal and the divine—a living bridge between worlds.",
        },
        {
          slug: "becoming-mountain",
          title: "Becoming Mountain",
          displayTitle: "Becoming Mountain",
          thumbnail: `${R2}/images/paintings-2026/becoming-mountain.jpg`,
          aspectRatio: 0.6371,
          materials: "Chinese pigment, pencil on paper, 43×76cm, 2026",
          layout: "left",
          description:
            "Through this work, Memory-Shan Shui evolves into a practice of shared embodiment. The mountain becomes Buddha, and Buddha becomes the mountain. Humans exist within this continuous transformation, sharing sensations of suffering and memories with all forms of being.",
        },
        {
          slug: "worlding",
          title: "Worlding",
          displayTitle: "Worlding",
          thumbnail: `${R2}/images/paintings-2026/worlding.jpg`,
          aspectRatio: 1.8887,
          materials: "Chinese pigment on paper, 68×33.5cm, 2026",
          layout: "wide",
          description:
            "Integrating explorations of the body, forest, mythology, and Shan Shui, the work brings diverse forms of life into a continuously emerging relational space. Gods, humans, and landscapes are no longer separate entities but mutually permeating forms of existence, challenging the conventional boundary between subject and object.",
        },
        {
          slug: "the-mountain-of-spirits",
          title: "The Mountain of Spirits",
          displayTitle: "The Mountain of Spirits",
          thumbnail: `${R2}/images/paintings-2026/the-mountain-of-spirits.jpg`,
          aspectRatio: 1.3517,
          layout: "partial",
          imgWidthRatio: 0.75,
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
          layout: "left",
          materials: "acrylic paint, pencil and crayon on paper, 21 x 30 cm, 2025",
        },
        {
          slug: "maternity-myth",
          title: "Maternity Myth",
          displayTitle: "Maternity Myth",
          thumbnail: "/images/paintings-2025/maternity-myth.png",
          aspectRatio: 1.2081,
          layout: "partial",
          imgWidthRatio: 0.75,
          materials: "oil painting on wood panel, 50 x 60 cm, 2025",
          description:
            "During my residency in Foshan, I conducted research on local myths and legends and learned about a distinctive female deity tradition in the Xijiang River basin of Guangdong—the worship of the Dragon Mother. Within this belief system, the Dragon Mother is regarded as the sovereign of the waters and a goddess of fertility and protection, embodying a dual role as both a maternal deity and a local guardian spirit. What moved me most was the story of the Dragon Mother originally being a mortal woman who accidentally found a dragon egg and hatched five baby dragons with her own hands. In this work, I imaginatively reconstruct this specific memory to highlight the water-spirit qualities and vital force embodied in her feminine divine power.",
        },
        {
          slug: "rock-and-tree-i",
          title: "Rock and Tree Ⅰ",
          displayTitle: "Rock and Tree Ⅰ",
          thumbnail: "/images/paintings-2025/rock-and-tree-ⅰ.png",
          aspectRatio: 1.011,
          layout: "partial",
          imgWidthRatio: 0.75,
          materials: "50 x 50 cm | mulberry paper mounted on wooden panel, Chinese pigments, ink, silver leaf | 2025",
          description:
            "The work centres on the \"rocks\" and \"trees\" of traditional Shan Shui, reinterpreting Taihu rocks and trees as symbols of personal lived experience. Rocks become metaphors for the body and identity, while trees intertwine, grow, and evolve with inner experience to form a continuously changing living system. The work further explores how natural elements in Shan Shui can act as mediators between humans and the world, developing artistic approaches to co-generating relationships with more-than-human beings.",
        },
        {
          slug: "rock-and-tree-ii",
          title: "Rock and Tree Ⅱ",
          displayTitle: "Rock and Tree Ⅱ",
          thumbnail: "/images/paintings-2025/rock-and-tree-ⅱ.png",
          aspectRatio: 1.0044,
          layout: "partial",
          imgWidthRatio: 0.75,
        },
        {
          slug: "sinking",
          title: "Sinking",
          displayTitle: "Sinking",
          thumbnail: "/images/paintings-2025/sinking.jpg",
          aspectRatio: 1.2281,
          layout: "wideBottom",
          materials: "quartz sand, acrylic, ink, chalk, gauze, ballpoint pen, plaster mixed media on oil canvas, 40 x 60 cm, 2025",
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
          layout: "right",
          materials: "lacquer, ink, traditional Chinese pigments mixed media on paper, 50 x 60 cm, 2025",
          description:
            "Through the tension between \"wildness\" and \"discipline,\" the work reexamines individual identity at the threshold between nature and society. The figure of the \"wild man\" operates simultaneously as a social identity and as a metaphor for the restoration of a connection between human beings and the natural world.",
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
          layout: "left",
          description:
            "During the Huzhou residency, I invited participants to collect naturally fallen leaves and transform these materials through handcraft into objects such as accessories and bookmarks. The workshop focused on processes of gathering, sensing, and making, exploring how humans and trees can establish a corresponding relationship through material engagement.",
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
          layout: "wide",
          materials: "video | size variable | 2026",
          description:
            "From a first-person perspective, I documented weddings within the rural mountain landscapes of Yunnan. The work reconstructs memories through fragmented images, moments of absence, voice-over narration, and Yi ethnic folk songs. The filmmaker remains a bodily participant within the image, allowing the moving image to become a process through which memories are co-generated by people and place, rather than an objective record. The work explores how moving images can function as a method of Memory-Shan Shui, understanding memory as an ongoing practice of correspondence between humans and their environments.",
          link: "https://youtu.be/uJXzXT_XhTk",
        },
        {
          slug: "embodied-memories-of-weishan",
          title: "Embodied Memories of Weishan",
          displayTitle: "Embodied Memories of Weishan",
          thumbnail:
            "/images/photograph-videos-2026/video/embodied-memories-of-weishan.jpg",
          aspectRatio: 1.7787,
          layout: "partial",
          materials: "video | size variable | 2026",
          description:
            "Using their own memory collage works as a medium, participants continuously reconfigured local memories through bodily actions in a projection theatre at night. Rather than attempting to represent Weishan, the work allows experiences of place to continuously emerge through collective performance. It explores Memory-Shan Shui as a method of shared embodied perception.",
          link: "https://youtu.be/MHIlvJIKeMI?is=iFzXhB4n7UK8lYqW",
        },
        {
          slug: "animism",
          title: "Animism",
          displayTitle: "Animism",
          thumbnail:
            "/images/photograph-videos-2026/photograph/animism-1.jpg",
          aspectRatio: 1.7778,
          layout: "grid",
          description:
            "This series was photographed in Tibet. Through my encounters with the ancient Himalayan landscape, I sensed a profound animistic presence embedded within the relationship between humans and the natural world. Mountains, rocks, animals, water, and other forms of existence appeared not as separate entities, but as interconnected beings sharing a living continuum.",
          images: Array.from({ length: 24 }, (_, i) => ({
            src: `/images/photograph-videos-2026/photograph/animism-${i + 1}.jpg`,
            alt: `Animism ${i + 1}`,
          })),
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
