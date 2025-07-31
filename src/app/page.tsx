import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      {/* CRT Background Effects Applied to Entire Page */}
      <div className="absolute inset-0 bg-black filter contrast-[1.2] brightness-110 glow-green">
        <div className="absolute inset-0 pointer-events-none z-2 crt-scanlines" />

        <div className="absolute inset-0 pointer-events-none z-3 crt-curvature" />

        <div className="absolute inset-0 pointer-events-none z-4 opacity-5 crt-flicker" />
      </div>

      {/* Content Layer */}
      <div className="crt-screen-transform relative z-10 h-full">
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-2 md:space-y-4 font-inconsolata text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl glow">
            Nick Michau
          </h1>
          <div className="flex flex-row items-center gap-1 md:gap-2 lg:gap-3 glow">
            <span className="text-sm sm:text-md md:text-lg lg:text-xl">❯</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Software Engineer
            </h2>
          </div>
          <Link
            href="mailto:nick@michau.uk"
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl glow hover:text-blue-300 hover:brightness-110 break-all sm:break-normal transition-colors duration-200"
          >
            nick@michau.uk
          </Link>
        </div>
      </div>
    </main>
  );
}