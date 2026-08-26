import { Navigation } from "@/components/navigation";

export const metadata = {
  title: "WORKS | Deng Manyuan",
  description: "Artworks and projects by Deng Manyuan.",
};

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <h1 className="text-6xl md:text-7xl font-serif italic text-gray-900 mb-8">
          WORKS
        </h1>
        <p className="text-lg text-gray-500">
          Coming soon. This page will feature paintings, installations, and
          workshops.
        </p>
      </div>
    </main>
  );
}
