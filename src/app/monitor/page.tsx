import { IconMail } from "@tabler/icons-react";
import Monitor from "../components/monitor";
import MonitorFrame from "../components/monitor-frame";
import ClearMonitor from "../components/clear-monitor";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="grid grid-cols-4 grid-rows-3 gap-6 h-full min-h-[90vh] max-w-[2000px]">


        <Monitor className="col-span-4 row-span-1">
          <div className="space-y-2">
            <pre className="text-4xl font-bold mb-4">{"Welcome, I'm Nick Michau"}</pre>
            <pre>{"Software Engineer"}</pre>
          </div>
        </Monitor>
        <div className="row-span-2 flex flex-col gap-6">
          <MonitorFrame
            imageSrc="/nick-cutout.png"
            imageAlt="Project screenshot"
            // imageClassName="brightness-75"
            imageClassName="brightness-77 contrast-112 saturate-90"
          />
          {/* <ClearMonitor className="flex-1">
            <div className="space-y-2">
              <pre>{"E: nick@michau.uk"}</pre>
              <pre>{"G: github.com/NOM1989"}</pre>
            </div>
          </ClearMonitor> */}
          <Monitor className="flex-1">
            <div className="space-y-2">
              <pre>{"E: nick@michau.uk"}</pre>
              <pre>{"G: github.com/NOM1989"}</pre>
            </div>
          </Monitor>
        </div>

        <div className="row-span-2 col-span-3 flex flex-row gap-6">
          <Monitor className="">
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
          </Monitor>

          <Monitor className="">
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
          </Monitor>
        </div>

      </div>
    </main>
  );
}

