export type SubPage = {
  images: { src: string; alt?: string; caption?: string }[];
  description?: string;
  layout?: "grid" | "single" | "stackedRight" | "textLeftStackedRight" | "fiveImageStack" | "row" | "leftMainRightStacked" | "rowCaption" | "multiRow";
  /**
   * multiRow 模板专用：每行放哪几张图片（images 中的下标索引），
   * 例：[[0,1,2,3], [4,5]] 表示共两行，第一行是第1~4张，第二行是第5~6张
   */
  rows?: number[][];
};

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
  subPages?: SubPage[];
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

const R2 = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev";

const BLANK = `${R2}/images/blank.svg`;

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
            `${R2}/images/paintings-2025/a-joke-on-fragmented-shan-shui/dsc02784.jpg`,
          aspectRatio: 1.0336,
        },
        {
          slug: "becoming-human",
          title: "Becoming Human Ⅰ Ⅱ Ⅲ",
          displayTitle: "Becoming Human Ⅰ Ⅱ Ⅲ",
          thumbnail:
            `${R2}/images/paintings-2025/becoming-human/contact-sheet-1.jpg`,
          aspectRatio: 1.1756,
        },
        {
          slug: "floating",
          title: "Floating",
          displayTitle: "Floating",
          thumbnail: `${R2}/images/paintings-2025/floating.jpg`,
          aspectRatio: 0.692,
          layout: "left",
          materials: "acrylic paint, pencil and crayon on paper, 21 x 30 cm, 2025",
        },
        {
          slug: "maternity-myth",
          title: "Maternity Myth",
          displayTitle: "Maternity Myth",
          thumbnail: `${R2}/images/paintings-2025/maternity-myth.png`,
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
          thumbnail: `${R2}/images/paintings-2025/rock-and-tree-ⅰ.png`,
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
          thumbnail: `${R2}/images/paintings-2025/rock-and-tree-ⅱ.png`,
          aspectRatio: 1.0044,
          layout: "partial",
          imgWidthRatio: 0.75,
        },
        {
          slug: "sinking",
          title: "Sinking",
          displayTitle: "Sinking",
          thumbnail: `${R2}/images/paintings-2025/sinking.jpg`,
          aspectRatio: 1.2281,
          layout: "wideBottom",
          materials: "quartz sand, acrylic, ink, chalk, gauze, ballpoint pen, plaster mixed media on oil canvas, 40 x 60 cm, 2025",
        },
        {
          slug: "tree-spirit",
          title: "Tree Spirit Ⅰ Ⅱ Ⅲ",
          displayTitle: "Tree Spirit Ⅰ Ⅱ Ⅲ",
          thumbnail:
            `${R2}/images/paintings-2025/tree-spirit/collected.png`,
          aspectRatio: 1.1099,
        },
        {
          slug: "wildmans-paradise",
          title: "Wildman's Paradise",
          displayTitle: "Wildman's Paradise",
          thumbnail:
            `${R2}/images/paintings-2025/wildmans-paradise.jpg`,
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
            `${R2}/images/paintings-2024/fragments-of-memory/collaged-landscape-scroll.png`,
          aspectRatio: 12.1744,
        },
        {
          slug: "bapo-shanshui",
          title: "Bapo Shanshui",
          displayTitle: "Bapo Shanshui",
          thumbnail: `${R2}/images/paintings-2024/bapo-shanshui.jpg`,
          aspectRatio: 1.3552,
        },
        {
          slug: "collaged-love",
          title: "Collaged Love",
          displayTitle: "Collaged Love",
          thumbnail: `${R2}/images/paintings-2024/collaged-love.png`,
          aspectRatio: 1.3862,
        },
        {
          slug: "non-dualism",
          title: "Non-Dualism",
          displayTitle: "Non-Dualism",
          thumbnail: `${R2}/images/paintings-2024/non-dualism.jpg`,
          aspectRatio: 1.5,
        },
        {
          slug: "sacred-sapling",
          title: "Sacred Sapling",
          displayTitle: "Sacred Sapling",
          thumbnail: `${R2}/images/paintings-2024/sacred-sapling.jpg`,
          aspectRatio: 0.9865,
        },
        {
          slug: "verdant-heaven",
          title: "Verdant Heaven",
          displayTitle: "Verdant Heaven",
          thumbnail: `${R2}/images/paintings-2024/verdant-heaven.jpg`,
          aspectRatio: 0.6975,
        },
      ],
    },
  },
  {
    slug: "installations",
    title: "Installations",
    coverImage:
      `${R2}/images/installations-2026/weishan-memory-ⅰ/main-1.png`,
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
            `${R2}/images/installations-2026/god-of-happiness/main-1.jpg`,
          aspectRatio: 1.8293,
          layout: "left",
          materials: "Co-created Painting Installation | 79cm×98cm | 2026",
          description:
            "This work consists of painted images of the Xi Shen Jia Ma (喜神甲马, ritual paper images of the God of Happiness) and a participatory ritual co-created with visitors.|In the painting, I incorporate traditional Xi Shen Jia Ma imagery from Weishan into a primordial atmosphere composed of black and red tones. The work is placed alongside the existing time-based installation in the Xiwey Courtyard, creating a sense of timelessness and continuity between the contemporary artwork and the historical space.",
          subPages: [
            {
              images: [
                { src: `${R2}/images/installations-2026/god-of-happiness/part-1.jpg`, alt: "God of Happiness detail 1" },
                { src: `${R2}/images/installations-2026/god-of-happiness/part-2.jpg`, alt: "God of Happiness detail 2" },
                { src: `${R2}/images/installations-2026/god-of-happiness/part-3.jpg`, alt: "God of Happiness detail 3" },
              ],
              description:
                "At the same time, the work functions as an open-ended ritual that invites viewers to participate in its completion. During the opening and throughout the exhibition, visitors were invited to join the co-creation of \"giving the body of the God of Happiness.\" Participants first removed the artwork from the wall and placed it horizontally, then applied glue onto the white figure of the God of Happiness before scattering grains of rice onto its surface and allowing the material to settle for several minutes.|This intimate ritual draws upon the local Weishan wedding custom of Xiao Tang (洗澡汤, \"receiving blessings\" (zhan xi qi 沾喜气). Through the integration of folk traditions, embodied actions, and visual practice, the work becomes a collective construction of shared hopes for happiness and prosperity rooted in a specific place and community.",
            },
            {
              layout: "single",
              images: [
                { src: `${R2}/images/installations-2026/god-of-happiness/part-4.jpg`, alt: "God of Happiness detail 4" },
              ],
            },
            {
              layout: "single",
              images: [
                { src: `${R2}/images/installations-2026/god-of-happiness/part-5.jpg`, alt: "God of Happiness detail 5" },
              ],
            },
            {
              layout: "single",
              images: [
                { src: `${R2}/images/installations-2026/god-of-happiness/part-6.jpg`, alt: "God of Happiness detail 6" },
              ],
            },
          ],
        },
        {
          slug: "weishan-memory-i",
          title: "Weishan Memory Ⅰ",
          displayTitle: "Weishan Memory Ⅰ",
          thumbnail:
            `${R2}/images/installations-2026/weishan-memory-ⅰ/main-1.png`,
          aspectRatio: 1.7769,
          layout: "wide",
          materials: "site- specific photo collage and visitor- interaction installation | 2026",
          description:
            "The photo collages in this work were produced by participants during a memory collage workshop. I placed these collages within the shrine of an old house, reconstructing them as part of the installation.",
          subPages: [
            {
              layout: "stackedRight",
              images: [
                { src: `${R2}/images/installations-2026/weishan-memory-ⅰ/part-2.jpg`, alt: "Weishan Memory I detail 2" },
                { src: `${R2}/images/installations-2026/weishan-memory-ⅰ/part-3.jpg`, alt: "Weishan Memory I detail 3" },
                { src: `${R2}/images/installations-2026/weishan-memory-ⅰ/part-1.jpg`, alt: "Weishan Memory I detail 1" },
              ],
              description:
                "During the exhibition, visitors were invited to identify which collage belonged to each empty frame on the wall by observing the photographs beneath them. Once identified correctly, they completed the installation by placing the collage themselves. Through photo collage, participants responded to their memories of Weishan, while visitors continuously reshaped the work through embodied interaction. Memory was thus transformed from an individual possession into a relational process, continuously responding, negotiating, and emerging between people.",
            },
          ],
        },
        {
          slug: "weishan-memory-ii",
          title: "Weishan Memory Ⅱ",
          displayTitle: "Weishan Memory Ⅱ",
          thumbnail:
            `${R2}/images/installations-2026/weishan-memory-ⅱ/main-1.jpg`,
          aspectRatio: 0.6283,
          layout: "right",
          materials: "mixed- media painting installation",
          description:
            "After the residency, I translated my personal memories and impressions of Weishan into five small paintings, layering them together to form an accumulating structure of visual memory. The work does not aim to represent a place, but instead understands place as something continuously generated through embodied experience, perception, and relational processes.",
          subPages: [
            {
              layout: "fiveImageStack",
              images: [
                {
                  src: `${R2}/images/installations-2026/weishan-memory-ⅱ/part-1.jpg`,
                  alt: "Weishan Memory Ⅱ part 1",
                },
                {
                  src: `${R2}/images/installations-2026/weishan-memory-ⅱ/part-3.jpg`,
                  alt: "Weishan Memory Ⅱ part 3",
                },
                {
                  src: `${R2}/images/installations-2026/weishan-memory-ⅱ/part-2.jpg`,
                  alt: "Weishan Memory Ⅱ part 2",
                },
                {
                  src: `${R2}/images/installations-2026/weishan-memory-ⅱ/part-4.jpg`,
                  alt: "Weishan Memory Ⅱ part 4",
                },
                {
                  src: `${R2}/images/installations-2026/weishan-memory-ⅱ/part-5.jpg`,
                  alt: "Weishan Memory Ⅱ part 5",
                },
              ],
            },
          ],
        },
      ],
      2025: [
        {
          slug: "memory-nearby-chengdu",
          title: "Memory Nearby-Chengdu",
          displayTitle: "Memory Nearby-Chengdu",
          thumbnail:
            `${R2}/images/installations-2025/memory-nearby/chengdu-version/main-1.jpg`,
          aspectRatio: 1.0,
          layout: "partial",
          materials: "site-specific installatioin\n2025",
          description:
            "Through collecting everyday objects from communities in Chengdu, the work transforms individual memory objects into resin forms and embeds them within a Shan Shui structure. Mountains, rivers, and branches become mediums through which relationships between people and place are collectively generated. Memory-Shan Shui explores how relational connections can emerge from everyday local experiences.",
          subPages: [
            {
              layout: "multiRow",
              rows: [[0, 1, 2, 3]],
              images: [
                { src: `${R2}/images/installations-2025/memory-nearby/chengdu-version/part-1.jpg`, alt: "Chengdu part 1" },
                { src: `${R2}/images/installations-2025/memory-nearby/chengdu-version/part-2.jpg`, alt: "Chengdu part 2" },
                { src: `${R2}/images/installations-2025/memory-nearby/chengdu-version/part-3.jpg`, alt: "Chengdu part 3" },
                { src: `${R2}/images/installations-2025/memory-nearby/chengdu-version/part-4.jpg`, alt: "Chengdu part 4" },
              ],
            },
          ],
        },
        {
          slug: "memory-nearby-huzhou",
          title: "Memory Nearby-Huzhou",
          displayTitle: "Memory Nearby-Huzhou",
          thumbnail:
            `${R2}/images/installations-2025/memory-nearby/huzhou-version/main-1.jpg`,
          aspectRatio: 1.0,
          layout: "right",
          materials: "site-specific installatioin | 2025",
          description:
            "Developing from the Chengdu version, the work introduces fallen trees and discarded chairs collected from the local surroundings, allowing memories of the city to transform within the space of an abandoned classroom. Later, the installation was reactivated as a wedding site, where photographs of newly married couples were placed upon a mountain-like structure made of black mesh. | New personal memories and social events became layered with existing memories, creating a continuously evolving archive of relationships. As audiences enter the installation, they encounter the interwoven memories of others, while their own memories become incorporated into this relational network of Shan Shui. Through embodied participation and the ongoing formation of memory, new relationships emerge between people, place, and lived experience.",
          subPages: [
            {
              layout: "row",
              images: [
                {
                  src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-1.jpg`,
                  alt: "Huzhou part 1",
                },
                {
                  src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-2.jpg`,
                  alt: "Huzhou part 2",
                },
                {
                  src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-3.jpg`,
                  alt: "Huzhou part 3",
                },
                {
                  src: `${R2}/images/installations-2025/memory-nearby/huzhou-version/part-4.jpg`,
                  alt: "Huzhou part 4",
                },
              ],
            },
          ],
        },
        {
          slug: "new-narrative-of-foshan",
          title: "New Narrative of Foshan",
          displayTitle: "New Narrative of Foshan",
          thumbnail:
            `${R2}/images/installations-2025/new-narrative-of-foshan/main-1.png`,
          aspectRatio: 1.7769,
          layout: "right",
          materials:
            "Collaborative painting installation | Assembled (layered) dimensions: 60 × 42 × 65 cm | Flat collage: 200 × 200 cm (individual panels: 60 × 60 cm) | Acrylic panels, acrylic paint, tracing paper, silver leaf, foil, stainless-steel frame | 2025",
          description:
            "I initiated a public co-creation call, inviting participants to draw the objects or images they associated most strongly with Foshan. After collecting these materials, I cut and collaged them onto nine acrylic panels, adding my own painting to form a complete image. The participants' drawings and my intervention together create a puzzle of local memory",
          subPages: [
            {
              layout: "leftMainRightStacked",
              description:
                "The work gathers multiple perceptions of the same place into one image, then separates and reconstructs it through the overlapping arrangement of acrylic panels on a structure. Through the layering and reconfiguration of transparent acrylic sheets, it reveals the interweaving and regeneration of spatial experiences within a sense of place: seemingly a linear cycle of time, yet actually an accumulation of multiple relationships and a collective perception of those who inhabit the place",
              images: [
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-1.png`,
                  alt: "Foshan part 1",
                },
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-2.jpg`,
                  alt: "Foshan part 2",
                },
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-3.png`,
                  alt: "Foshan part 3",
                },
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-4.png`,
                  alt: "Foshan part 4",
                },
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-5.png`,
                  alt: "Foshan part 5",
                },
              ],
            },
            {
              layout: "grid",
              images: [
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-6.png`,
                  alt: "Foshan part 6",
                  caption: "the paintings collected from collaborators",
                },
                {
                  src: `${R2}/images/installations-2025/new-narrative-of-foshan/part-7.jpg`,
                  alt: "Foshan part 7",
                },
              ],
            },
          ],
        },
        {
          slug: "spirit-dwelling",
          title: "Spirit Dwelling",
          displayTitle: "Spirit Dwelling",
          thumbnail:
            `${R2}/images/installations-2025/spirit-dwelling/main-1.jpg`,
          aspectRatio: 0.6035,
          layout: "left",
          materials:
            "Mixed media painting installation\nOil canvas, quartz sand, ink, acrylic paint, oil paint, paper pulp, silver foil, silver chains, nails, etc.\n40 cm x 60 cm\n2025",
          description:
            "作品中的文字是关于 “居住” 、“栖息”的几个甲骨文，如“门”、“室”、“舍”等。树木的根系在大地里自由恣意生长，梦境的紫色烟雾中有山水树石的美好宇宙和我心里的十个太阳。果绿色的花瓶是梦境的出口，也可以在现实中放置一些珍贵的记忆之物。",
          subPages: [
            {
              layout: "multiRow",
              rows: [[0, 1, 2, 3], [4, 5, 6, 7]],
              images: [
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-1.jpg`, alt: "Spirit Dwelling part 1" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-2.jpg`, alt: "Spirit Dwelling part 2" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-3.jpg`, alt: "Spirit Dwelling part 3" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-4.jpg`, alt: "Spirit Dwelling part 4" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-5.jpg`, alt: "Spirit Dwelling part 5" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-6.jpg`, alt: "Spirit Dwelling part 6" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-7.jpg`, alt: "Spirit Dwelling part 7" },
                { src: `${R2}/images/installations-2025/spirit-dwelling/part-8.jpg`, alt: "Spirit Dwelling part 8" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "workshops",
    title: "Workshops",
    coverImage:
      `${R2}/images/workshops-2026/weishan-memory-collage-workshop/main.jpg`,
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
            `${R2}/images/workshops-2026/weishan-memory-collage-workshop/main-1.jpg`,
          aspectRatio: 1.3654,
          layout: "right",
          description:
            "I invited each participant to select three photographs that represented their memories of Weishan and transform them through cutting, collage, and painting.\n\nWorking with photographs embedded with personal memories, participants collectively constructed experiences of place through processes of making, storytelling, and reconfiguration.\n\nThe workshop approaches place as a relational network that is continuously sensed, narrated, and regenerated, developing Memory-Shan Shui as an artistic practice through which place-based knowledge emerges together with individual life histories.",
          subPages: [
            {
              layout: "multiRow",
              rows: [[0, 1, 2], [3, 4], [5, 6, 7, 8]],
              description: "the collage works made by participants",
              images: [
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-1.jpg`, alt: "Collage workshop part 1" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-2.jpg`, alt: "Collage workshop part 2" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-3.jpg`, alt: "Collage workshop part 3" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-4.jpg`, alt: "Collage workshop part 4" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-5.jpg`, alt: "Collage workshop part 5" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-6.jpg`, alt: "Collage workshop part 6" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-7.jpg`, alt: "Collage workshop part 7" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-8.jpg`, alt: "Collage workshop part 8" },
                { src: `${R2}/images/workshops-2026/weishan-memory-collage-workshop/part-9.jpg`, alt: "Collage workshop part 9" },
              ],
            },
          ],
        },
      ],
      2025: [
        {
          slug: "the-memory-ritual-of-leaves-and-trees",
          title: "The Memory Ritual of Leaves and Trees",
          displayTitle: "the Memory Ritual of Leaves and Trees",
          thumbnail:
            `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/main-1.jpg`,
          aspectRatio: 1.7768,
          layout: "left",
          description:
            "During the Huzhou residency, I invited participants to collect naturally fallen leaves and transform these materials through handcraft into objects such as accessories and bookmarks.\n\nThe workshop focused on processes of gathering, sensing, and making, exploring how humans and trees can establish a corresponding relationship through material engagement.",
          subPages: [
            {
              layout: "multiRow",
              rows: [[0, 1, 2, 3], [4, 5, 6, 7, 8]],
              images: [
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-1.jpg`, alt: "Workshop part 1" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-2.jpg`, alt: "Workshop part 2" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-3.jpg`, alt: "Workshop part 3" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-4.jpg`, alt: "Workshop part 4" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-5.jpg`, alt: "Workshop part 5" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-6.jpg`, alt: "Workshop part 6" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-7.jpg`, alt: "Workshop part 7" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-8.jpg`, alt: "Workshop part 8" },
                { src: `${R2}/images/workshops-2025/the-memory-ritual-of-leaves-and-trees/part-9.jpg`, alt: "Workshop part 9" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "photograph-videos",
    title: "Photograph & Videos",
    coverImage:
      `${R2}/images/photograph-videos-2026/photograph/animism-1.jpg`,
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
            `${R2}/images/photograph-videos-2026/video/a-wedding-within-shan-shui.png`,
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
            `${R2}/images/photograph-videos-2026/video/embodied-memories-of-weishan.jpg`,
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
            `${R2}/images/photograph-videos-2026/photograph/animism-1.jpg`,
          aspectRatio: 1.7778,
          layout: "grid",
          description:
            "This series was photographed in Tibet. Through my encounters with the ancient Himalayan landscape, I sensed a profound animistic presence embedded within the relationship between humans and the natural world. Mountains, rocks, animals, water, and other forms of existence appeared not as separate entities, but as interconnected beings sharing a living continuum.",
          images: Array.from({ length: 24 }, (_, i) => ({
            src: `${R2}/images/photograph-videos-2026/photograph/animism-${i + 1}.jpg`,
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
