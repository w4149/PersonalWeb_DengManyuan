import { Navigation } from "@/components/navigation";

export const metadata = {
  title: "ABOUT | Deng Manyuan",
  description:
    "Learn about Deng Manyuan's artistic practice, Memory-Shan Shui methodology, exhibitions, residencies, and work experience.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-24">
        {/* Page Title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif italic text-gray-900 mb-16">
          ABOUT
        </h1>

        {/* Bio Section */}
        <section className="mb-16">
          <p className="text-lg md:text-xl leading-relaxed text-gray-800 mb-6">
            As an artist-researcher, Deng Manyuan graduated with a Master&apos;s
            degree in Fine Arts from Sichuan University in 2025. She explores an
            artistic methodology of{" "}
            <strong className="font-semibold text-gray-900">
              &ldquo;Memory-Shan Shui (记忆山水),&rdquo;
            </strong>{" "}
            which integrates the formation of memory with a contemporary
            reinterpretation of Chinese Shan Shui aesthetics.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-gray-600 italic mb-8">
            (note: Shan Shui, retained in its Chinese form, refers to a
            relational worldview rather than simply Chinese landscape painting.)
          </p>

          <p className="text-lg md:text-xl leading-relaxed text-gray-800">
            Through{" "}
            <strong className="font-semibold text-amber-700">
              walking, observation, collecting, photography, painting, and
              participatory practices,
            </strong>{" "}
            she develops relationships with local communities and more-than-human
            beings, exploring the transformation from memory and empathy toward
            correspondence, as well as ecological expression and knowledge
            production.
          </p>
        </section>

        {/* Memory-Shan Shui Concept */}
        <section className="mb-16">
          <p className="text-lg md:text-xl leading-relaxed text-gray-800 mb-6">
            <strong className="font-semibold text-amber-700">
              Memory-Shan Shui
            </strong>{" "}
            is a concept proposed by Deng Manyuan. It is not a style of
            painting, but a relational ecological philosophy and artistic
            methodology in which memory, place, and more-than-human beings
            coexist, emerge, and communicate with one another. Through{" "}
            <strong className="font-semibold text-amber-700">
              the intersection of tradition and contemporary practice,
            </strong>{" "}
            her work investigates and responds to interdisciplinary questions
            concerning memory, perception, human-nature relationships,
            communities, and place. Within the framework of Shan Shui, these
            relationships are continuously reorganized and reimagined.
          </p>

          <p className="text-lg md:text-xl leading-relaxed text-gray-800">
            In terms of visual language, her paintings incorporate traditional
            Chinese visual imagery into contemporary ecological and
            anthropological contexts. Figures and animals often appear as{" "}
            <strong className="font-semibold text-amber-700">
              silhouettes,
            </strong>{" "}
            with blurred forms suggesting vitality and movement. She usually
            depicts{" "}
            <strong className="font-semibold text-amber-700">
              ten suns
            </strong>{" "}
            in her paintings, constructing a{" "}
            <strong className="font-semibold text-amber-700">
              primordial mythological universe.
            </strong>{" "}
            Mountains, stones, trees, humans, and supernatural beings inhabit the
            same space, creating a multidimensional environment of coexistence,
            interconnection, and shared dwelling.
          </p>
        </section>

        {/* Two Column Layout: Exhibitions & Residencies */}
        <section className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
          {/* Exhibitions */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8">
              Exhibitions
            </h2>

            <div className="space-y-8">
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

          {/* Artist Residencies & Work Experience */}
          <div className="space-y-16">
            {/* Residencies */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8">
                Artist Residencies
              </h2>

              <div className="space-y-6">
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

            {/* Work Experience */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-8">
                Work Experience
              </h2>

              <div className="space-y-8">
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
    </main>
  );
}

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
      <h3 className="text-lg font-medium italic text-gray-900 mb-1">
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
      <h3 className="text-base font-medium italic text-gray-900">{title}</h3>
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
      <h3 className="text-base font-medium italic text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{place}</p>
    </div>
  );
}
