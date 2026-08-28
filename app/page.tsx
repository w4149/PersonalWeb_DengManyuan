import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { CategoryGallery } from "@/components/category-gallery";
import { workCategories } from "@/lib/works-data";

const TITLE_FONT =
  "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";

export default function HomePage() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth snap-y snap-proximity bg-white">
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>

      {/* ============================================================
          SECTION 1 · HOME
      ============================================================ */}
      <section
        id="home"
        className="snap-start min-h-screen w-full relative flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 py-24 sm:py-20"
      >
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900 leading-tight">
            Deng Manyuan{" "}
            <span className="block sm:inline text-gray-400 font-normal text-2xl sm:text-3xl md:text-5xl lg:text-6xl mt-2 sm:mt-0">
              邓嫚媛
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl italic text-gray-500 font-light">
            Visual Artist & Artistic Researcher
          </p>

          <p className="mt-6 sm:mt-10 max-w-3xl text-base sm:text-base md:text-lg leading-relaxed text-gray-700">
            Deng Manyuan is a visual artist and artistic researcher. Her practice
            employs{" "}
            <strong className="font-semibold text-gray-900">
              painting, installation, video, and participatory workshops
            </strong>{" "}
            as primary mediums, exploring interdisciplinary questions at the
            intersection of{" "}
            <strong className="font-semibold text-gray-900">
              visual art, anthropology, and ecology
            </strong>
            .
          </p>
        </div>

        <div className="mt-12 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8 md:sm:bottom-12 md:sm:right-12">
          <div className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 px-4 py-2 rounded">
            <span className="text-sm text-gray-500">Contact:</span>
            <a
              href="mailto:manyuan717@outlook.com"
              className="text-sm text-gray-800 hover:text-gray-950 transition-colors break-all"
            >
              manyuan717@outlook.com
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 · ABOUT
      ============================================================ */}
      <section
        id="about"
        className="snap-start min-h-screen w-full"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-gray-900 mb-12 md:mb-16">
            ABOUT
          </h1>

          <section className="mb-12 md:mb-16">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-800 mb-4 md:mb-6">
              As an artist-researcher, Deng Manyuan graduated with a Master&apos;s
              degree in Fine Arts from Sichuan University in 2025. She explores an
              artistic methodology of{" "}
              <strong className="font-semibold text-gray-900">
                &ldquo;Memory-Shan Shui (记忆山水),&rdquo;
              </strong>{" "}
              which integrates the formation of memory with a contemporary
              reinterpretation of Chinese Shan Shui aesthetics.
            </p>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 italic mb-6 md:mb-8">
              (note: Shan Shui, retained in its Chinese form, refers to a
              relational worldview rather than simply Chinese landscape painting.)
            </p>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-800">
              Through{" "}
              <strong className="font-semibold text-gray-900">
                walking, observation, collecting, photography, painting, and
                participatory practices,
              </strong>{" "}
              she develops relationships with local communities and more-than-human
              beings, exploring the transformation from memory and empathy toward
              correspondence, as well as ecological expression and knowledge
              production.
            </p>
          </section>

          <section className="mb-12 md:mb-16">
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-800 mb-4 md:mb-6">
              <strong className="font-semibold text-gray-900">
                Memory-Shan Shui
              </strong>{" "}
              is a concept proposed by Deng Manyuan. It is not a style of
              painting, but a relational ecological philosophy and artistic
              methodology in which memory, place, and more-than-human beings
              coexist, emerge, and communicate with one another. Through{" "}
              <strong className="font-semibold text-gray-900">
                the intersection of tradition and contemporary practice,
              </strong>{" "}
              her work investigates and responds to interdisciplinary questions
              concerning memory, perception, human-nature relationships,
              communities, and place. Within the framework of Shan Shui, these
              relationships are continuously reorganized and reimagined.
            </p>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-800">
              In terms of visual language, her paintings incorporate traditional
              Chinese visual imagery into contemporary ecological and
              anthropological contexts. Figures and animals often appear as{" "}
              <strong className="font-semibold text-gray-900">
                silhouettes,
              </strong>{" "}
              with blurred forms suggesting vitality and movement. She usually
              depicts{" "}
              <strong className="font-semibold text-gray-900">
                ten suns
              </strong>{" "}
              in her paintings, constructing a{" "}
              <strong className="font-semibold text-gray-900">
                primordial mythological universe.
              </strong>{" "}
              Mountains, stones, trees, humans, and supernatural beings inhabit the
              same space, creating a multidimensional environment of coexistence,
              interconnection, and shared dwelling.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-10 md:gap-16 mb-12 md:mb-16">
            <div>
              <hr className="border-t border-gray-200 mb-8 md:mb-10" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-6 md:mb-8">
                Exhibitions
              </h2>

              <div className="space-y-6 md:space-y-8">
                <ExhibitionItem
                  period="2026.4 - 2026.5"
                  title="the Ritual of Daily Life"
                  type="Group Exhibition at Xiwei Art Life, Weishan"
                />

                <ExhibitionItem
                  period="2025.8 - 2025.9"
                  title="Mountains after Mountains"
                  type="Solo Exhibition at Ooops Cafe Space, Chengdu"
                />

                <ExhibitionItem
                  period="2025.3 - 2025.5"
                  title="Circular Ruins"
                  type="Group Exhibition at Lanting Paradise Art Space, Huzhou"
                />

                <ExhibitionItem
                  period="2024.11 - 2025.2"
                  title='Darkness and Renewal: Memory Expressions of "Wandering" in Shanshui'
                  type="Solo Exhibition at Shan Bakery, Chengdu"
                />
              </div>
            </div>

            <div className="space-y-12 md:space-y-16">
              <div>
                <hr className="border-t border-gray-200 mb-8 md:mb-10" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-6 md:mb-8">
                  Artist Residencies
                </h2>

                <div className="space-y-4 md:space-y-6">
                  <ResidencyItem
                    period="2026.4"
                    title="Xizaotang Young Artists' Art Residency, Weishan"
                  />
                  <ResidencyItem
                    period="2025.10"
                    title="Four Season Art: Scope - International Art Residency, Foshan"
                  />
                  <ResidencyItem
                    period="2025.4"
                    title="Lanting Paradise Residency Program, Huzhou"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-6 md:mb-8">
                  Work Experience
                </h2>

                <div className="space-y-6 md:space-y-8">
                  <WorkExperienceItem
                    period="2025.3 - 2025.9"
                    title="Curator & Researcher"
                    place="Zhuxi Art Space, Chengdu"
                  />
                  <WorkExperienceItem
                    period="2023.9 - 2024.6"
                    title="Artist Assistant"
                    place="A4 International Artist Residency Center, Chengdu"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 · WORKS
      ============================================================ */}
      <section
        id="works"
        className="snap-start min-h-screen w-full"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-gray-900 mb-12 md:mb-16">
            WORKS
          </h1>

          <Suspense fallback={null}>
            <CategoryGallery categories={workCategories} />
          </Suspense>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 · RESEARCHES
      ============================================================ */}
      <section
        id="researches"
        className="snap-start min-h-screen w-full"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl italic text-gray-900 mb-12 md:mb-16"
            style={{ fontFamily: TITLE_FONT }}
          >
            RESEARCHES
          </h1>

          <section className="mb-12">
            <h2
              className="text-lg font-bold text-gray-900 mb-3"
              style={{ fontFamily: TITLE_FONT }}
            >
              Master&apos;s Dissertation
            </h2>
            <p
              className="text-base text-gray-700 leading-relaxed"
              style={{ fontFamily: TITLE_FONT }}
            >
              Identity Issues in International Art Residencies: A Case Study of the
              A4 International Art Residency Program (2011–2024)
            </p>
          </section>

          <section className="mb-12">
            <h2
              className="text-lg font-bold text-gray-900 mb-3"
              style={{ fontFamily: TITLE_FONT }}
            >
              Papers
            </h2>
            <p
              className="text-base text-gray-700 leading-relaxed"
              style={{ fontFamily: TITLE_FONT }}
            >
              Deng, M. (2024) &apos;The System of Application and Aesthetic Spirit
              of Traditional Chinese Colors&apos;, <em>Beidahuang Culture</em>,
              (4), pp. 31–32.{" "}
              <a
                href="http://xueshu.qikan.com.cn/preview/1/114/3568675"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                http://xueshu.qikan.com.cn/preview/1/114/3568675
              </a>
            </p>
          </section>

          <section className="mb-12">
            <h2
              className="text-lg font-bold text-gray-900 mb-3"
              style={{ fontFamily: TITLE_FONT }}
            >
              Conference
            </h2>
            <p
              className="text-base text-gray-700 leading-relaxed"
              style={{ fontFamily: TITLE_FONT }}
            >
              Presented at the 2024 Classic Discover International Conference on
              Sino-European Artistic Exchanges and Mutual Learning among
              Civilizations in the Age of Digital Globalization (July 22nd, 2024
              Rome, Italy)
            </p>
          </section>

          <section className="mb-12">
            <h2
              className="text-lg font-bold text-gray-900 mb-3"
              style={{ fontFamily: TITLE_FONT }}
            >
              Public Lectures
            </h2>
            <div
              className="text-base text-gray-700 leading-relaxed space-y-1"
              style={{ fontFamily: TITLE_FONT }}
            >
              <p>
                Topic: The Evolution of Traditional Chinese Shanshui Painting and
                its Transformation of Modern and Contemporary Times
              </p>
              <p>Invited by: Czech-Chinese Society</p>
              <p>Date and Place: August 15th, 2024 Prague, Czech Republic</p>
            </div>
          </section>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 · NEWS
      ============================================================ */}
      <section
        id="news"
        className="snap-start min-h-screen w-full"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif italic text-gray-900 mb-8 md:mb-12">
            NEWS
          </h1>
          <p className="text-lg text-gray-500">
            Coming soon. This page will feature upcoming exhibitions, events, and
            news.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ------------------------- ABOUT section helpers ------------------------- */

function ExhibitionItem({
  period,
  title,
  type,
}: {
  period: string;
  title: string;
  type: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{period}</p>
      <h3 className="text-base sm:text-lg font-medium italic text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{type}</p>
    </div>
  );
}

function ResidencyItem({
  period,
  title,
}: {
  period: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{period}</p>
      <h3 className="text-sm sm:text-base font-medium italic text-gray-900">{title}</h3>
    </div>
  );
}

function WorkExperienceItem({
  period,
  title,
  place,
}: {
  period: string;
  title: string;
  place: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{period}</p>
      <h3 className="text-sm sm:text-base font-medium italic text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{place}</p>
    </div>
  );
}
