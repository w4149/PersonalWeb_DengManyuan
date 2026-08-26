import { Navigation } from "@/components/navigation";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-gray-900">
            Deng Manyuan{" "}
            <span className="text-gray-400 font-normal text-4xl md:text-5xl lg:text-6xl">
              邓嫚媛
            </span>
          </h1>

          <p className="mt-6 text-2xl md:text-3xl lg:text-4xl italic text-gray-500 font-light">
            Visual Artist & Artistic Researcher
          </p>

          <p className="mt-10 max-w-3xl text-base md:text-lg leading-relaxed text-gray-700">
            Deng Manyuan is a visual artist and artistic researcher. Her practice
            employs{" "}
            <strong className="font-semibold text-amber-700">
              painting, installation, video, and participatory workshops
            </strong>{" "}
            as primary mediums, exploring interdisciplinary questions at the
            intersection of{" "}
            <strong className="font-semibold text-amber-700">
              visual art, anthropology, and ecology
            </strong>
            .
          </p>
        </div>

        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
          <div className="inline-flex items-center gap-2 border border-amber-200 bg-amber-50/50 px-4 py-2 rounded">
            <span className="text-sm text-gray-500">Contact:</span>
            <a
              href="mailto:manyuan717@outlook.com"
              className="text-sm text-amber-700 hover:text-amber-800 transition-colors"
            >
              manyuan717@outlook.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
