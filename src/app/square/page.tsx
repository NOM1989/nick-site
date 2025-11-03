"use client";

import { useEffect, useRef } from "react";

const CONFIG = {
  GRID_SIZE: 20,
  RADIUS: 50,
  MAX_DESCEND: 80, // Maximum pillar descent in pixels
  DESCEND_SPEED: 0.15,
  RECOVER_SPEED: 0.05,
  GRADIENT_RADIUS: 200,
} as const;

type SquareState = { descend: number; targetDescend: number };

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const squareRefs = useRef<(HTMLDivElement | null)[]>([]);
  const statesRef = useRef<SquareState[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const totalSquares = CONFIG.GRID_SIZE ** 2;
    statesRef.current = Array.from({ length: totalSquares }, () => ({ descend: 0, targetDescend: 0 }));

    const positions = squareRefs.current.map((sq) => {
      if (!sq) return null;
      const rect = sq.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      let needsUpdate = false;
      const mouse = mouseRef.current;

      squareRefs.current.forEach((square, i) => {
        if (!square) return;

        const state = statesRef.current[i];
        const pos = positions[i];

        // Calculate target descend based on distance to mouse
        if (mouse && pos) {
          const dist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
          state.targetDescend = dist < CONFIG.RADIUS ? lerp(CONFIG.MAX_DESCEND, 0, dist / CONFIG.RADIUS) : 0;
        } else {
          state.targetDescend = 0;
        }

        // Smooth descend transition
        const speed = state.descend < state.targetDescend ? CONFIG.DESCEND_SPEED : CONFIG.RECOVER_SPEED;
        state.descend = lerp(state.descend, state.targetDescend, speed);

        if (Math.abs(state.descend - state.targetDescend) > 0.001) needsUpdate = true;

        // Calculate pillar effect values
        const descendRatio = state.descend / CONFIG.MAX_DESCEND;
        const translateY = state.descend; // Pillar descends
        const shadowOffset = state.descend * 0.5; // Shadow grows as pillar descends
        const shadowBlur = state.descend * 0.8;
        
        // Apply isometric 3D transform with pillar descent
        square.style.transform = `translateY(${translateY}px)`;
        square.style.transition = 'background-color 0.2s ease';
        
        // Orange glow when descended
        if (descendRatio > 0.01) {
          const glowIntensity = descendRatio * 0.8;
          square.style.boxShadow = `
            0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${descendRatio * 0.6}),
            inset 0 0 ${descendRatio * 30}px rgba(249, 115, 22, ${glowIntensity}),
            0 0 ${descendRatio * 40}px rgba(249, 115, 22, ${glowIntensity * 0.6})
          `;
          square.style.backgroundColor = `rgb(${249 * descendRatio}, ${115 * descendRatio}, ${22 * descendRatio})`;
        } else {
          square.style.boxShadow = 'none';
          square.style.backgroundColor = '#000';
        }

        // Apply radial gradient overlay for extra glow
        if (mouse && pos) {
          const gradDist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
          const gradIntensity = Math.max(0, 1 - gradDist / CONFIG.GRADIENT_RADIUS);
          if (gradIntensity > 0.01) {
            const baseOrange = descendRatio > 0.01;
            const r = Math.min(255, (baseOrange ? 249 * descendRatio : 0) + 249 * gradIntensity * 0.3);
            const g = Math.min(255, (baseOrange ? 115 * descendRatio : 0) + 115 * gradIntensity * 0.3);
            const b = Math.min(255, (baseOrange ? 22 * descendRatio : 0) + 22 * gradIntensity * 0.3);
            square.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          }
        }
      });

      if (needsUpdate) rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center">
      <div
        ref={containerRef}
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${CONFIG.GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${CONFIG.GRID_SIZE}, 1fr)`,
          transform: 'rotateX(60deg) rotateZ(45deg)',
          transformStyle: 'preserve-3d',
          perspective: '1200px',
          width: '80vmin',
          height: '80vmin',
        }}
      >
        {Array.from({ length: CONFIG.GRID_SIZE ** 2 }, (_, i) => (
          <div
            key={i}
            ref={(el) => { squareRefs.current[i] = el; }}
            className="aspect-square"
            style={{
              backgroundColor: '#000',
              border: '0.5px solid rgba(100, 100, 100, 0.5)',
              transformStyle: 'preserve-3d',
              willChange: 'transform, background-color, box-shadow',
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(-20vh)' }}>
        <h1 className="text-4xl font-bold text-white">Move your mouse!</h1>
      </div>
    </main>
  );
}
