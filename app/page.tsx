import { Navigation } from "@/components/navigation";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="relative min-h-screen flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 py-24 sm:py-20">
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

        <div className="mt-12 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8 md:sm:bottom-12 md:sm:right-12">
          <div className="inline-flex items-center gap-2 border border-amber-200 bg-amber-50/50 px-4 py-2 rounded">
            <span className="text-sm text-gray-500">Contact:</span>
            <a
              href="mailto:manyuan717@outlook.com"
              className="text-sm text-amber-700 hover:text-amber-800 transition-colors break-all"
            >
              manyuan717@outlook.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
