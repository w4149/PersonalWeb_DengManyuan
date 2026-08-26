import { Navigation } from "@/components/navigation";
import { CategoryGallery } from "@/components/category-gallery";
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

        <CategoryGallery categories={workCategories} />
      </div>
    </main>
  );
}
