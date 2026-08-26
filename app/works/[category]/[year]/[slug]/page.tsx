import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import {
  getCategory,
  getWork,
  getWorksByYear,
  workCategories,
} from "@/lib/works-data";

export function generateStaticParams() {
  const params: { category: string; year: string; slug: string }[] = [];
  for (const cat of workCategories) {
    if (!cat.worksByYear) continue;
    for (const [yearStr, works] of Object.entries(cat.worksByYear)) {
      for (const work of works) {
        params.push({
          category: cat.slug,
          year: yearStr,
          slug: work.slug,
        });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; year: string; slug: string }>;
}) {
  const { category: categorySlug, year: yearStr, slug } = await params;
  const work = getWork(categorySlug, parseInt(yearStr, 10), slug);
  if (!work) return {};
  return {
    title: `${work.title} | Deng Manyuan`,
    description: `${work.title} by Deng Manyuan.`,
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ category: string; year: string; slug: string }>;
}) {
  const { category: categorySlug, year: yearStr, slug } = await params;
  const year = parseInt(yearStr, 10);
  const category = getCategory(categorySlug);
  const work = getWork(categorySlug, year, slug);

  if (!category || !work) {
    notFound();
  }

  const works = getWorksByYear(categorySlug, year) || [];
  const currentIndex = works.findIndex((w) => w.slug === slug);
  const prevWork = currentIndex > 0 ? works[currentIndex - 1] : null;
  const nextWork =
    currentIndex < works.length - 1 ? works[currentIndex + 1] : null;

  const aspectRatio = work.aspectRatio;
  const maxWidth = aspectRatio >= 1.2 ? 900 : aspectRatio <= 0.7 ? 500 : 700;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/works" className="hover:text-amber-700 transition-colors">
            WORKS
          </Link>
          <span>/</span>
          <Link
            href={`/works/${category.slug}/${year}`}
            className="hover:text-amber-700 transition-colors"
          >
            {category.title}
          </Link>
          <span>/</span>
          <span className="text-gray-700">{year}</span>
          <span>/</span>
          <span className="text-amber-700">{work.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-16">
          <div className="md:col-span-3 flex items-start justify-center">
            <div
              className="bg-gray-50 rounded-sm overflow-hidden"
              style={{
                width: "100%",
                maxWidth: `${maxWidth}px`,
              }}
            >
              <img
                src={work.thumbnail}
                alt={work.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-gray-900 mb-2">
              {work.title}
            </h1>
            <p className="text-lg text-gray-400 font-light mb-8 tabular-nums">
              {year}
            </p>

            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-600 leading-relaxed">
                Detailed description of this artwork will be added here.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between text-sm border-t border-gray-200 pt-8">
          <div className="flex gap-4">
            {prevWork && (
              <Link
                href={`/works/${category.slug}/${year}/${prevWork.slug}`}
                className="text-gray-600 hover:text-amber-700 transition-colors"
              >
                ← {prevWork.title}
              </Link>
            )}
            {nextWork && (
              <Link
                href={`/works/${category.slug}/${year}/${nextWork.slug}`}
                className="text-gray-600 hover:text-amber-700 transition-colors"
              >
                {nextWork.title} →
              </Link>
            )}
          </div>
          <Link
            href={`/works/${category.slug}/${year}`}
            className="text-gray-500 hover:text-amber-700 transition-colors"
          >
            ← Back to {category.title} {year}
          </Link>
        </div>
      </div>
    </main>
  );
}
