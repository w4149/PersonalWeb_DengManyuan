import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { workCategories } from "@/lib/works-data";

export const metadata = {
  title: "WORKS | Deng Manyuan",
  description:
    "Paintings, installations, workshops, and photograph & videos by Deng Manyuan.",
};

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-gray-900 mb-12 md:mb-16">
          WORKS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16">
          {workCategories.map((category) => (
            <WorkBlock key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </main>
  );
}

function WorkBlock({
  category,
}: {
  category: (typeof workCategories)[number];
}) {
  return (
    <div className="group">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <Link
          href={`/works/${category.slug}/${category.years[0]}`}
          className="relative flex-1 overflow-hidden rounded-sm aspect-[4/3] sm:aspect-[4/3] group/item"
        >
          <img
            src={category.coverImage}
            alt={category.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h2 className="absolute bottom-4 left-4 right-4 text-xl sm:text-2xl md:text-3xl font-medium text-white tracking-wide">
            {category.title}
          </h2>
        </Link>

        <div className="flex flex-col sm:justify-center gap-2 sm:gap-3 min-w-[80px] sm:min-w-[100px]">
          {category.years.map((year) => (
            <Link
              key={year}
              href={`/works/${category.slug}/${year}`}
              className="flex items-center gap-2 py-1.5 px-2 rounded text-sm sm:text-base text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors text-right sm:text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-amber-500 transition-colors shrink-0" />
              <span className="tabular-nums">{year}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
