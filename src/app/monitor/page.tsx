import { IconMail } from "@tabler/icons-react";
import Monitor from "../components/monitor";
import MonitorFrame from "../components/monitor-frame";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="grid grid-cols-4 grid-rows-3 gap-6 h-full min-h-[40vh] max-w-[2000px]">
        <Monitor className="col-span-3 row-span-2">
          <div className="space-y-2">
            <pre className="text-4xl font-bold mb-4">{"Nick Michau"}</pre>
            <pre>{"Hi!"}</pre>
          </div>
        </Monitor>

        <div className="row-span-2 flex flex-col gap-6">
          <MonitorFrame
            imageSrc="/nick-cutout.png"
            imageAlt="Project screenshot"
            // imageClassName="brightness-75"
            imageClassName="brightness-77 contrast-112 saturate-90"
          />
          <Monitor className="flex-1">
            <div className="space-y-2">
              {/* <pre className="flex items-center gap-1">
                <IconMail className="" size={24} />
                {"nick@michau.uk"}
              </pre> */}
              <pre>{"E: nick@michau.uk"}</pre>
              <pre>{"G: github.com/NOM1989"}</pre>
            </div>
          </Monitor>
        </div>


        <Monitor>
          <div className="space-y-2">
            <pre className="text-2xl font-bold mb-4">{"Terminal"}</pre>
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

        <Monitor className="col-span-2">
          <div className="space-y-2">
            <pre className="text-4xl font-bold mb-4">{"Nick Michau"}</pre>
            <div className="mt-4">
              <pre className="inline">
                {"> "}
                <span className="animate-pulse">_</span>
              </pre>
            </div>
          </div>
        </Monitor>

        <Monitor className="">
          <div className="space-y-2">
            <pre className="text-4xl font-bold mb-4">{"Nick Michau"}</pre>
            <div className="mt-4">
              <pre className="inline">
                {"> "}
                <span className="animate-pulse">_</span>
              </pre>
            </div>
          </div>
        </Monitor>
      </div>
    </main>
  );
}

