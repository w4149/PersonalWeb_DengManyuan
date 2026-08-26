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

export const workCategories: WorkCategory[] = [
  {
    slug: "paintings",
    title: "Paitings",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20Chinese%20ink%20and%20color%20painting%2C%20abstract%20landscape%20with%20vibrant%20purple%20and%20turquoise%20swirling%20patterns%2C%20artistic%2C%20museum%20quality%2C%20detail%20visible%2C%20rich%20textures&image_size=landscape_4_3",
    years: [2026, 2025, 2024],
    worksByYear: {
      2026: [
        {
          slug: "tree-pulse",
          title: "Tree Pulse",
          thumbnail:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20painting%20on%20rice%20paper%2C%20swirling%20purple%20and%20turquoise%20colors%2C%20flowing%20energy%20patterns%2C%20contemporary%20Chinese%20ink%20art%2C%20square%20format%2C%20gallery%20photography&image_size=square",
        },
        {
          slug: "world-tree",
          title: "World Tree",
          thumbnail:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20mystical%20painting%20of%20a%20tree%20of%20life%2C%20twisted%20branches%20reaching%20skyward%2C%20small%20bird%20on%20branch%2C%20ink%20and%20color%20on%20paper%2C%20contemporary%20Chinese%20art%2C%20square%20format&image_size=square",
        },
        {
          slug: "becoming-mountain",
          title: "Becoming Mountain",
          thumbnail:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=contemplative%20figure%20seated%20on%20rocky%20mountain%2C%20meditative%20painting%2C%20earthy%20tones%20with%20subtle%20gold%20accents%2C%20Chinese%20ink%20on%20paper%2C%20spiritual%20art%2C%20square%20format&image_size=square",
        },
        {
          slug: "worlding",
          title: "Worlding",
          thumbnail:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20landscape%20painting%2C%20intricate%20blue%20and%20purple%20linework%20creating%20worlds%2C%20cosmic%20patterns%2C%20Chinese%20contemporary%20ink%20art%2C%20square%20format%2C%20detailed&image_size=square",
        },
        {
          slug: "mountain-of-spirits",
          title: "The Mountain of Spirits",
          thumbnail:
            "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mystical%20mountain%20landscape%20painting%2C%20layered%20blue%20and%20violet%20mountain%20ridges%2C%20ethereal%20atmosphere%2C%20Chinese%20ink%20and%20color%20on%20paper%2C%20contemporary%2C%20square%20format&image_size=square",
        },
      ],
    },
  },
  {
    slug: "installations",
    title: "Installations",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large-scale%20installation%20art%2C%20dark%20fabric%20sculpture%20hanging%20in%20white%20gallery%20space%2C%20dramatic%20lighting%2C%20black%20and%20white%20art%2C%20site-specific%2C%20contemporary%20art%20exhibition&image_size=landscape_4_3",
    years: [2026, 2025],
  },
  {
    slug: "workshops",
    title: "Workshops",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=community%20art%20workshop%2C%20people%20painting%20together%20at%20wooden%20table%2C%20colorful%20art%20supplies%20and%20brushes%2C%20warm%20natural%20light%2C%20candid%20photography%2C%20inclusive%20creative%20atmosphere&image_size=landscape_4_3",
    years: [2026, 2025],
  },
  {
    slug: "photograph-videos",
    title: "Photograph & Videos",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=photography%20and%20video%20art%2C%20dramatic%20side%20lighting%2C%20artist%20portrait%20with%20camera%2C%20cinematic%20black%20and%20white%2C%20moody%20atmosphere%2C%20shot%20on%20film&image_size=landscape_4_3",
    years: [2026],
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
