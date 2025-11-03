'use client';

import { useEffect, useRef } from 'react';

interface Tile {
  x: number;
  y: number;
  depth: number;
  targetDepth: number;
}

export default function IsometricPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<Tile[]>([]);
  const tileMapRef = useRef<Map<string, Tile>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const GRID_SIZE = 20; // Number of tiles per row/column
  const TILE_SIZE = 40; // Size of each tile
  const MAX_DEPTH = 120; // Maximum depth a tile can sink
  const INFLUENCE_RADIUS = 150; // How far the mouse influence extends

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize tiles and tile map for O(1) neighbor lookups
    const tiles: Tile[] = [];
    const tileMap = new Map<string, Tile>();
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = {
          x,
          y,
          depth: 0,
          targetDepth: 0,
        };
        tiles.push(tile);
        tileMap.set(`${x},${y}`, tile);
      }
    }
    tilesRef.current = tiles;
    tileMapRef.current = tileMap;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Convert grid coordinates to screen coordinates (isometric projection)
    const toScreen = (x: number, y: number, depth: number = 0) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 3;
      
      const isoX = (x - y) * TILE_SIZE * 0.866; // cos(30°) ≈ 0.866
      const isoY = (x + y) * TILE_SIZE * 0.5 + depth; // sin(30°) = 0.5
      
      return {
        x: centerX + isoX,
        y: centerY + isoY,
      };
    };

    // Draw a tile with depth
    const drawTile = (tile: Tile) => {
      const { x, y, depth } = tile;
      
      // Calculate corner positions
      const top = toScreen(x, y, depth);
      const right = toScreen(x + 1, y, depth);
      const bottom = toScreen(x + 1, y + 1, depth);
      const left = toScreen(x, y + 1, depth);
      
      // Top face (the visible square)
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(right.x, right.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      
      // Gradient for top face
      const gradient = ctx.createRadialGradient(
        (top.x + bottom.x) / 2,
        (top.y + bottom.y) / 2,
        0,
        (top.x + bottom.x) / 2,
        (top.y + bottom.y) / 2,
        TILE_SIZE
      );
      
      // Tron-style cyan/blue colors
      const brightness = Math.max(0.1, 1 - depth / MAX_DEPTH * 0.7);
      gradient.addColorStop(0, `rgba(0, ${Math.floor(150 * brightness)}, ${Math.floor(200 * brightness)}, 0.8)`);
      gradient.addColorStop(1, `rgba(0, ${Math.floor(50 * brightness)}, ${Math.floor(100 * brightness)}, 0.6)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Glowing border
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.6 * brightness})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw side faces if depth > 0 (pillar effect)
      // When a tile sinks, we need to show the walls connecting it to shallower neighbors
      if (depth > 2) {
        // Get adjacent tile depths using O(1) map lookups
        const tileMap = tileMapRef.current;
        const topDepth = tileMap.get(`${x},${y - 1}`)?.depth ?? 0;
        const rightDepth = tileMap.get(`${x + 1},${y}`)?.depth ?? 0;
        const leftDepth = tileMap.get(`${x},${y + 1}`)?.depth ?? 0;
        const topLeftDepth = tileMap.get(`${x - 1},${y}`)?.depth ?? 0;
        
        // Reuse corner calculations to avoid redundant toScreen calls
        const topLeftDeep = top;
        const topRightDeep = right;
        const bottomLeftDeep = left;
        const bottomRightDeep = bottom;
        
        // Right face - draw if the right neighbor is shallower (this tile has sunk more)
        if (depth > rightDepth + 1) {
          const topRightShallow = toScreen(x + 1, y, rightDepth);
          const bottomRightShallow = toScreen(x + 1, y + 1, rightDepth);
          
          ctx.beginPath();
          ctx.moveTo(topRightDeep.x, topRightDeep.y);
          ctx.lineTo(topRightShallow.x, topRightShallow.y);
          ctx.lineTo(bottomRightShallow.x, bottomRightShallow.y);
          ctx.lineTo(bottomRightDeep.x, bottomRightDeep.y);
          ctx.closePath();
          
          ctx.fillStyle = `rgba(0, ${Math.floor(40 * brightness)}, ${Math.floor(80 * brightness)}, 0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 150, 200, ${0.5 * brightness})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Left face - draw if the left neighbor is shallower
        if (depth > leftDepth + 1) {
          const bottomLeftShallow = toScreen(x, y + 1, leftDepth);
          const bottomRightShallow = toScreen(x + 1, y + 1, leftDepth);
          
          ctx.beginPath();
          ctx.moveTo(bottomLeftDeep.x, bottomLeftDeep.y);
          ctx.lineTo(bottomLeftShallow.x, bottomLeftShallow.y);
          ctx.lineTo(bottomRightShallow.x, bottomRightShallow.y);
          ctx.lineTo(bottomRightDeep.x, bottomRightDeep.y);
          ctx.closePath();
          
          ctx.fillStyle = `rgba(0, ${Math.floor(25 * brightness)}, ${Math.floor(50 * brightness)}, 0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 120, 180, ${0.4 * brightness})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Top face - draw if the top neighbor is shallower
        if (depth > topDepth + 1) {
          const topLeftShallow = toScreen(x, y, topDepth);
          const topRightShallow = toScreen(x + 1, y, topDepth);
          
          ctx.beginPath();
          ctx.moveTo(topLeftDeep.x, topLeftDeep.y);
          ctx.lineTo(topLeftShallow.x, topLeftShallow.y);
          ctx.lineTo(topRightShallow.x, topRightShallow.y);
          ctx.lineTo(topRightDeep.x, topRightDeep.y);
          ctx.closePath();
          
          ctx.fillStyle = `rgba(0, ${Math.floor(60 * brightness)}, ${Math.floor(100 * brightness)}, 0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 170, 220, ${0.6 * brightness})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Front-right face (x-1 direction) - draw if the left-front neighbor is shallower
        if (depth > topLeftDepth + 1) {
          const topLeftShallow = toScreen(x, y, topLeftDepth);
          const bottomLeftShallow = toScreen(x, y + 1, topLeftDepth);
          
          ctx.beginPath();
          ctx.moveTo(topLeftDeep.x, topLeftDeep.y);
          ctx.lineTo(topLeftShallow.x, topLeftShallow.y);
          ctx.lineTo(bottomLeftShallow.x, bottomLeftShallow.y);
          ctx.lineTo(bottomLeftDeep.x, bottomLeftDeep.y);
          ctx.closePath();
          
          ctx.fillStyle = `rgba(0, ${Math.floor(70 * brightness)}, ${Math.floor(110 * brightness)}, 0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 180, 230, ${0.65 * brightness})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update tile depths based on mouse position
      tilesRef.current.forEach((tile) => {
        const screenPos = toScreen(tile.x + 0.5, tile.y + 0.5, 0);
        const dx = mouseRef.current.x - screenPos.x;
        const dy = mouseRef.current.y - screenPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate target depth based on distance
        if (distance < INFLUENCE_RADIUS) {
          const influence = 1 - distance / INFLUENCE_RADIUS;
          tile.targetDepth = influence * MAX_DEPTH;
        } else {
          tile.targetDepth = 0;
        }
        
        // Smooth interpolation
        tile.depth += (tile.targetDepth - tile.depth) * 0.15;
      });
      
      // Draw tiles in proper order (back to front) without creating a copy
      // Since tiles are already sorted by (y, x) from initialization, we can draw directly
      tilesRef.current.forEach(drawTile);
      
      // Add glow effect around mouse
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        INFLUENCE_RADIUS
      );
      gradient.addColorStop(0, 'rgba(0, 200, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute top-8 left-8 z-10 text-cyan-400 font-mono">
        <h1 className="text-2xl font-bold mb-2" style={{ textShadow: '0 0 10px rgba(0, 200, 255, 0.8)' }}>
          Isometric Grid
        </h1>
        <p className="text-sm opacity-70">Move your mouse to interact</p>
      </div>
    </main>
  );
}