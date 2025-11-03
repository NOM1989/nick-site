"use client";

import { useEffect, useRef } from "react";

const CONFIG = {
  GRID_SIZE: 40,
  RADIUS: 150,
  MIN_SCALE: 0.5,
  SHRINK_SPEED: 0.15,
  RECOVER_SPEED: 0.05,
  GRADIENT_RADIUS: 200,
} as const;

type SquareState = { scale: number; targetScale: number };

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
    statesRef.current = Array.from({ length: totalSquares }, () => ({ scale: 1, targetScale: 1 }));

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

        // Calculate target scale based on distance to mouse
        if (mouse && pos) {
          const dist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
          state.targetScale = dist < CONFIG.RADIUS ? lerp(CONFIG.MIN_SCALE, 1, dist / CONFIG.RADIUS) : 1;
        } else {
          state.targetScale = 1;
        }

        // Smooth scale transition
        const speed = state.scale > state.targetScale ? CONFIG.SHRINK_SPEED : CONFIG.RECOVER_SPEED;
        state.scale = lerp(state.scale, state.targetScale, speed);

        if (Math.abs(state.scale - state.targetScale) > 0.001) needsUpdate = true;

        // Apply 3D scale with rotation and depth
        const shrinkRatio = 1 - state.scale;
        const rotateX = shrinkRatio * 15; // Tilt based on shrink
        const translateZ = shrinkRatio * -30; // Push back in Z-space
        const shadowDepth = shrinkRatio * 20;
        const shadowBlur = shrinkRatio * 40;
        
        square.style.transform = `perspective(1000px) rotateX(${rotateX}deg) scale(${state.scale}) translateZ(${translateZ}px)`;
        square.style.transition = 'background-color 0.2s ease';
        square.style.boxShadow = shrinkRatio > 0.01 
          ? `0 ${shadowDepth}px ${shadowBlur}px rgba(0, 0, 0, ${shrinkRatio * 0.8}), inset 0 0 ${shrinkRatio * 20}px rgba(249, 115, 22, ${shrinkRatio * 0.5})`
          : 'none';
        square.style.backgroundColor = shrinkRatio > 0.01 ? `rgb(${249 * shrinkRatio}, ${115 * shrinkRatio}, ${22 * shrinkRatio})` : '#000';

        // Apply radial gradient overlay
        if (mouse && pos) {
          const gradDist = Math.hypot(pos.x - mouse.x, pos.y - mouse.y);
          const gradIntensity = Math.max(0, 1 - gradDist / CONFIG.GRADIENT_RADIUS);
          if (gradIntensity > 0.01) {
            const overlayColor = `rgba(249, 115, 22, ${gradIntensity * 0.3})`;
            square.style.backgroundColor = shrinkRatio > 0.01 
              ? `rgb(${Math.min(255, 249 * shrinkRatio + 249 * gradIntensity * 0.3)}, ${Math.min(255, 115 * shrinkRatio + 115 * gradIntensity * 0.3)}, ${Math.min(255, 22 * shrinkRatio + 22 * gradIntensity * 0.3)})`
              : overlayColor;
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
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <div
        ref={containerRef}
        className="grid h-screen w-full"
        style={{
          gridTemplateColumns: `repeat(${CONFIG.GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${CONFIG.GRID_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: CONFIG.GRID_SIZE ** 2 }, (_, i) => (
          <div
            key={i}
            ref={(el) => { squareRefs.current[i] = el; }}
            className="aspect-square"
            style={{
              backgroundColor: '#000',
              border: '0.5px solid rgb(255, 255, 255)',
              transformStyle: 'preserve-3d',
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Move your mouse!</h1>
      </div>
    </main>
  );
}
