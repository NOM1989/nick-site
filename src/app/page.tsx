import { ModeToggle } from "./components/mode-toggle";
import RetroDisplay from "./components/retro-display";

export default function Home() {
  return (
    <main>
      <h1>Hi I'm Nick!</h1>
      <RetroDisplay />
      <ModeToggle />
    </main>
  );
}
