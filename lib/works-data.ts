export type WorkCategory = {
  slug: string;
  title: string;
  coverImage: string;
  years: number[];
};

export const workCategories: WorkCategory[] = [
  {
    slug: "paintings",
    title: "Paitings",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20Chinese%20ink%20and%20color%20painting%2C%20abstract%20landscape%20with%20vibrant%20purple%20and%20turquoise%20swirling%20patterns%2C%20artistic%2C%20museum%20quality%2C%20detail%20visible%2C%20rich%20textures&image_size=landscape_4_3",
    years: [2026, 2025, 2024],
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
