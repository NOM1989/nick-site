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

            <Window title="Profile" className="row-span-2 col-span-2 flex flex-col gap-6">
              <div className="flex flex-col items-center space-y-6 h-full">
                {/* Profile Image */}
                <div className="relative w-full h-64">
                  <Image
                    src="/nick-cutout.png"
                    alt="Picture of Nick Michau"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>

                {/* Contact Information */}
                <div className="text-center space-y-3 flex-1">
                  <div className="text-lg font-medium text-green-400">
                    E:
                    <Link
                      href="mailto:nick@michau.uk"
                      className="ml-2 text-green-300 hover:text-green-200 hover:underline transition-colors glow"
                    >
                      nick@michau.uk
                    </Link>
                  </div>

                  <div className="text-lg font-medium text-green-400">
                    G:
                    <Link
                      href="https://github.com/NOM1989"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-green-300 hover:text-green-200 hover:underline transition-colors glow"
                    >
                      github.com/NOM1989
                    </Link>
                  </div>
                </div>
              </div>
            </Window>

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

            <RetroDisplay></RetroDisplay>

          </div>
        </div>
      </div>
    </main>
  );
}
