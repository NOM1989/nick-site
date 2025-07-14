import { ModeToggle } from "./components/mode-toggle";
import RetroDisplay from "./components/retro-display";

export default function Home() {
  return (
    <main>
      <RetroDisplay />
      <ModeToggle />
    </main>
  );
}
