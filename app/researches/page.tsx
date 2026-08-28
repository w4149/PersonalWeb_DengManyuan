import { Suspense } from "react";
import { Navigation } from "@/components/navigation";

const TITLE_FONT =
  "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";

export const metadata = {
  title: "RESEARCHES | Deng Manyuan",
  description: "Research projects and publications by Deng Manyuan.",
};

export default function ResearchesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>

      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <h1
          className="text-6xl md:text-7xl italic text-gray-900 mb-16"
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
    </main>
  );
}
