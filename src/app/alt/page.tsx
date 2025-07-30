import { IconMail } from "@tabler/icons-react";
import MonitorFrame from "../components/monitor-frame";
import RetroDisplay from "../components/retro-display";
import Window from "../components/window";
import Image from "next/image";
import Link from "next/link";

export default function AltPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-black">
      {/* CRT Background Effects Applied to Entire Page */}
      <div className="absolute inset-0 bg-black filter contrast-[1.2] brightness-110 glow-green">
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />

        {/* Screen Curvature Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 crt-curvature" />

        {/* Subtle flicker effect */}
        <div className="absolute inset-0 pointer-events-none z-40 opacity-5 crt-flicker" />
      </div>

      {/* Content Layer */}
      <div className="relative z-50 p-6 crt-screen-transform">
        <div className="crt-content-transform">
          <div className="grid grid-cols-8 grid-rows-3 gap-6 h-full min-h-[90vh] max-w-[2000px] text-white font-inconsolata text-[1.3rem] leading-[1.4]">

            <div className="col-span-6 row-span-1 p-6">
              <div className="space-y-2">
                <pre className="text-4xl font-bold mb-4">{"Welcome, I'm Nick Michau"}</pre>
                <div className="text-2xl">{"Masters of Software Engineering"}</div>
              </div>
            </div>

            <div className="row-span-1 col-span-2 bg-white/30 backdrop-blur-sm border-4 border-white/50 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 flex items-center gap-2 bg-black/40 border-b border-green-500/30">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/60 border border-red-300/30"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60 border border-yellow-300/30"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/60 border border-green-300/30"></div>
                  </div>
                  <div className="flex-1 text-center text-3xl font-medium text-green-300 font-inconsolata tracking-wide">
                    nick@michau.uk
                  </div>
                </div>

                <div className="flex-1 relative">
                  <Image
                    src="/nick-cutout.png"
                    alt="Picture of Nick Michau"
                    fill
                    className="object-cover object-top brightness-90"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="row-span-2 col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-green-500/30 p-6">
              <div className="space-y-2">
                <pre className="text-2xl font-bold mb-4">{"❯ Experience"}</pre>
                <pre>{"$ whoami"}</pre>
                <pre>{"nick"}</pre>
                <pre>{"$ pwd"}</pre>
                <pre>{"/home/nick/projects"}</pre>
                <div className="mt-4">
                  <pre className="inline">
                    {"$ "}
                    <span className="animate-pulse">_</span>
                  </pre>
                </div>
              </div>
            </div>



            <div className="row-span-2 col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-green-500/30 p-6">
              <div className="space-y-2">
                <pre className="text-2xl font-bold mb-4">{"❯ Projects"}</pre>
                <pre>{"$ whoami"}</pre>
                <pre>{"nick"}</pre>
                <pre>{"$ pwd"}</pre>
                <pre>{"/home/nick/projects"}</pre>
                <div className="mt-4">
                  <pre className="inline">
                    {"$ "}
                    <span className="animate-pulse">_</span>
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
