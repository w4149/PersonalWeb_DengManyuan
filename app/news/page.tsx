import { Navigation } from "@/components/navigation";

export const metadata = {
  title: "NEWS | Deng Manyuan",
  description: "News and updates about Deng Manyuan's exhibitions and events.",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <h1 className="text-6xl md:text-7xl font-serif italic text-gray-900 mb-8">
          NEWS
        </h1>
        <p className="text-lg text-gray-500">
          Coming soon. This page will feature upcoming exhibitions, events, and
          news.
        </p>
      </div>
    </main>
  );
}
