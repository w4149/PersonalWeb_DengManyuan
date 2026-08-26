import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { getCategory, workCategories } from "@/lib/works-data";

export function generateStaticParams() {
  const params: { category: string; year: string }[] = [];
  for (const cat of workCategories) {
    for (const year of cat.years) {
      params.push({ category: cat.slug, year: String(year) });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; year: string }>;
}) {
  const { category: categorySlug, year: yearStr } = await params;
  const category = getCategory(categorySlug);
  if (!category) return {};
  return {
    title: `${category.title} ${yearStr} | Deng Manyuan`,
    description: `${category.title} works from ${yearStr} by Deng Manyuan.`,
  };
}

export default async function WorkCategoryYearPage({
  params,
}: {
  params: Promise<{ category: string; year: string }>;
}) {
  const { category: categorySlug, year: yearStr } = await params;
  const category = getCategory(categorySlug);
  const year = parseInt(yearStr, 10);

  if (!category || isNaN(year) || !category.years.includes(year)) {
    notFound();
  }

  const yearIndex = category.years.indexOf(year);
  const prevYear =
    yearIndex < category.years.length - 1
      ? category.years[yearIndex + 1]
      : null;
  const nextYear =
    yearIndex > 0 ? category.years[yearIndex - 1] : null;

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/works" className="hover:text-amber-700 transition-colors">
            WORKS
          </Link>
          <span>/</span>
          <span className="text-gray-700">{category.title}</span>
          <span>/</span>
          <span className="text-amber-700">{year}</span>
        </nav>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-gray-900 mb-4">
          {category.title}
        </h1>
        <p className="text-2xl sm:text-3xl md:text-4xl text-gray-400 font-light mb-12 md:mb-16 tabular-nums">
          {year}
        </p>

        <div className="border-t border-gray-200 pt-12">
          <p className="text-lg text-gray-500 italic">
            Works from this period will be listed here.
          </p>
        </div>

        <div className="mt-16 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            {prevYear && (
              <Link
                href={`/works/${category.slug}/${prevYear}`}
                className="text-gray-600 hover:text-amber-700 transition-colors"
              >
                ← {prevYear}
              </Link>
            )}
            {nextYear && (
              <Link
                href={`/works/${category.slug}/${nextYear}`}
                className="text-gray-600 hover:text-amber-700 transition-colors"
              >
                {nextYear} →
              </Link>
            )}
          </div>
          <Link
            href="/works"
            className="text-gray-500 hover:text-amber-700 transition-colors"
          >
            ← All Works
          </Link>
        </div>
      </div>
    </main>
  );
}
