'use client';

import { useEffect, useRef } from 'react';

// Constants for isometric projection and animation
const ISO_COS_30 = 0.866; // Math.cos(30° in radians) ≈ 0.866025403784
const ISO_SIN_30 = 0.5;   // Math.sin(30° in radians) = 0.5
const LERP_SPEED = 0.15;  // Animation interpolation speed
const MIN_VISIBLE_DEPTH = 0.1; // Threshold for considering tile at rest
const MANHATTAN_TO_EUCLIDEAN = 1.4; // Conservative multiplier for early rejection
const MAX_TILES = 800;

// TypedArray indices for tile data
const enum TileIndex {
  X = 0,
  Y = 1,
  DEPTH = 2,
  TARGET_DEPTH = 3,
  SIZE = 4 // Number of properties per tile
}

interface ScreenPosition {
  x: number;
  y: number;
}

interface GridParams {
  readonly tileSize: number;
  readonly maxDepth: number;
  readonly influenceRadius: number;
}

export default function IsometricPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use TypedArray for better performance and memory layout
  const tilesDataRef = useRef<Float32Array>(new Float32Array(0));
  const tileCountRef = useRef<number>(0);
  const tileMapRef = useRef<Map<string, number>>(new Map()); // Maps to tile index
  const mouseRef = useRef<ScreenPosition>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const gridParamsRef = useRef<GridParams>({ 
    tileSize: 100, 
    maxDepth: 120, 
    influenceRadius: 150 
  });
  
  // Cache for expensive calculations
  const cacheRef = useRef({
    centerX: 0,
    centerY: 0,
    isoWidthMultiplier: 0,
    isoHeightMultiplier: 0,
    canvasWidth: 0,
    canvasHeight: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate responsive parameters based on viewport
    const calculateParams = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Base tile size on viewport
      let tileSize: number;
      let maxDepth: number;
      let influenceRadius: number;
      
      if (width < 480) {
        // Mobile portrait
        tileSize = 60;
        maxDepth = 80;
        influenceRadius = 100;
      } else if (width < 768) {
        // Mobile landscape / small tablet
        tileSize = 70;
        maxDepth = 100;
        influenceRadius = 120;
      } else if (width < 1024) {
        // Tablet
        tileSize = 80;
        maxDepth = 110;
        influenceRadius = 140;
      } else {
        // Desktop
        tileSize = 90;
        maxDepth = 120;
        influenceRadius = 150;
      }
      
      gridParamsRef.current = { 
        gridWidth: 0, // Not used
        gridHeight: 0, // Not used
        tileSize, 
        maxDepth, 
        influenceRadius 
      };
      return { tileSize, maxDepth, influenceRadius };
    };

    // Set canvas size and recalculate grid
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const params = calculateParams();
      
      // Update cache with new canvas dimensions and multipliers
      cacheRef.current.centerX = canvas.width / 2;
      cacheRef.current.centerY = canvas.height / 2;
      cacheRef.current.isoWidthMultiplier = params.tileSize * ISO_COS_30;
      cacheRef.current.isoHeightMultiplier = params.tileSize * ISO_SIN_30;
      
      // Create viewport-optimized tile layout accounting for rotation
      const tiles: Tile[] = [];
      const tileMap = new Map<string, Tile>();
      
      const viewportWidth = canvas.width;
      const viewportHeight = canvas.height;
      const margin = params.tileSize * 2;
      
      // Isometric projection constants
      const isoWidth = cacheRef.current.isoWidthMultiplier;
      const isoHeight = cacheRef.current.isoHeightMultiplier;
      
      // Transform viewport corners to grid coordinate space
      // Inverse transform: given screen (sx, sy) relative to center, find grid (x, y)
      // sx = (x - y) * isoWidth  =>  x - y = sx / isoWidth
      // sy = (x + y) * isoHeight =>  x + y = sy / isoHeight
      // Solving: x = (sx/isoWidth + sy/isoHeight) / 2
      //          y = (sy/isoHeight - sx/isoWidth) / 2
      
      const { centerX, centerY } = cacheRef.current;
      
      // Calculate bounds by transforming viewport corners (with margin)
      const corners = [
        { sx: -margin, sy: -margin },                    // top-left
        { sx: viewportWidth + margin, sy: -margin },     // top-right
        { sx: viewportWidth + margin, sy: viewportHeight + margin }, // bottom-right
        { sx: -margin, sy: viewportHeight + margin }     // bottom-left
      ];
      
      let minSum = Infinity, maxSum = -Infinity;
      let minDiff = Infinity, maxDiff = -Infinity;
      
      corners.forEach(corner => {
        const sx = corner.sx - centerX;
        const sy = corner.sy - centerY;
        
        // Transform to grid space
        const sumValue = sy / isoHeight;  // x + y
        const diffValue = sx / isoWidth;  // x - y
        
        minSum = Math.min(minSum, sumValue);
        maxSum = Math.max(maxSum, sumValue);
        minDiff = Math.min(minDiff, diffValue);
        maxDiff = Math.max(maxDiff, diffValue);
      });
      
      // Round to integers and ensure we cover the bounds
      const sumStart = Math.floor(minSum);
      const sumEnd = Math.ceil(maxSum);
      const diffStart = Math.floor(minDiff);
      const diffEnd = Math.ceil(maxDiff);
      
      // Generate tiles with proper parity handling to ensure integer coordinates
      // Key insight: x = (sum + diff)/2 and y = (sum - diff)/2 are integers
      // if and only if sum and diff have the same parity (both even or both odd)
      let tileCount = 0;
      
      outerLoop: for (let sum = sumStart; sum <= sumEnd; sum++) {
        for (let diff = diffStart; diff <= diffEnd; diff++) {
          // Only generate when sum and diff have same parity
          // This eliminates the 50% waste from checking non-integer coordinates
          if ((sum + diff) % 2 === 0) {
            const x = (sum + diff) / 2;
            const y = (sum - diff) / 2;
            
            const tile = {
              x: x,
              y: y,
              depth: 0,
              targetDepth: 0,
            };
            tiles.push(tile);
            tileMap.set(`${tile.x},${tile.y}`, tile);
            
            tileCount++;
            if (tileCount >= MAX_TILES) {
              break outerLoop;
            }
          }
        }
      }
      
      tilesRef.current = tiles;
      tileMapRef.current = tileMap;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse and touch move handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Convert grid coordinates to screen coordinates (isometric projection)
    // Optimized to use cached values and reduce allocations
    const toScreen = (x: number, y: number, depth: number = 0): ScreenPosition => {
      const { centerX, centerY, isoWidthMultiplier, isoHeightMultiplier } = cacheRef.current;
      
      const isoX = (x - y) * isoWidthMultiplier;
      const isoY = (x + y) * isoHeightMultiplier + depth;
      
      return {
        x: centerX + isoX,
        y: centerY + isoY,
      };
    };

    // Check if tile is visible in viewport (optimized)
    const isTileVisible = (x: number, y: number): boolean => {
      const { centerX, centerY, isoWidthMultiplier, isoHeightMultiplier } = cacheRef.current;
      const { tileSize } = gridParamsRef.current;
      
      // Quick check using grid coordinates (cheaper than full projection)
      const isoX = (x - y) * isoWidthMultiplier;
      const isoY = (x + y) * isoHeightMultiplier;
      
      const screenX = centerX + isoX;
      const screenY = centerY + isoY;
      
      const margin = tileSize * 1.5;
      
      return (
        screenX > -margin &&
        screenX < canvas.width + margin &&
        screenY > -margin &&
        screenY < canvas.height + margin
      );
    };

    // Draw a tile with depth
    const drawTile = (tile: Tile) => {
      const { x, y, depth } = tile;
      
      // Skip tiles outside viewport
      if (!isTileVisible(x, y)) {
        return;
      }
      
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
      const { tileSize, maxDepth } = gridParamsRef.current;
      const centerX = (top.x + bottom.x) * 0.5;
      const centerY = (top.y + bottom.y) * 0.5;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, tileSize
      );
      
      // Tron-style cyan/blue colors - pre-calculate brightness once
      const brightness = Math.max(0.1, 1 - (depth / maxDepth) * 0.7);
      const g0 = Math.floor(150 * brightness);
      const b0 = Math.floor(200 * brightness);
      const g1 = Math.floor(50 * brightness);
      const b1 = Math.floor(100 * brightness);
      
      gradient.addColorStop(0, `rgba(0,${g0},${b0},0.8)`);
      gradient.addColorStop(1, `rgba(0,${g1},${b1},0.6)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Glowing border
      ctx.strokeStyle = `rgba(0,200,255,${0.6 * brightness})`;
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
        
        // Pre-calculate color values for side faces
        const sideG1 = Math.floor(40 * brightness);
        const sideB1 = Math.floor(80 * brightness);
        const sideG2 = Math.floor(25 * brightness);
        const sideB2 = Math.floor(50 * brightness);
        const sideG3 = Math.floor(60 * brightness);
        const sideB3 = Math.floor(100 * brightness);
        const sideG4 = Math.floor(70 * brightness);
        const sideB4 = Math.floor(110 * brightness);
        
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
          
          ctx.fillStyle = `rgba(0,${sideG1},${sideB1},0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,150,200,${0.5 * brightness})`;
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
          
          ctx.fillStyle = `rgba(0,${sideG2},${sideB2},0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,120,180,${0.4 * brightness})`;
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
          
          ctx.fillStyle = `rgba(0,${sideG3},${sideB3},0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,170,220,${0.6 * brightness})`;
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
          
          ctx.fillStyle = `rgba(0,${sideG4},${sideB4},0.85)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,180,230,${0.65 * brightness})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    // Animation loop
    const animate = () => {
      const { influenceRadius, maxDepth } = gridParamsRef.current;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update tile depths based on mouse position
      // Only calculate for visible tiles or tiles currently animating
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const tiles = tilesRef.current;
      const tilesLength = tiles.length;
      
      for (let i = 0; i < tilesLength; i++) {
        const tile = tiles[i];
        
        // Skip invisible tiles that are at rest
        if (tile.depth < MIN_VISIBLE_DEPTH && tile.targetDepth < MIN_VISIBLE_DEPTH) {
          if (!isTileVisible(tile.x, tile.y)) {
            continue;
          }
        }
        
        // Quick distance check using Manhattan distance (cheaper than Euclidean)
        const screenPos = toScreen(tile.x + 0.5, tile.y + 0.5, 0);
        const dx = mouseX - screenPos.x;
        const dy = mouseY - screenPos.y;
        const manhattanDist = Math.abs(dx) + Math.abs(dy);
        
        // Early exit if definitely out of range (Manhattan distance * 0.7 ≈ Euclidean)
        if (manhattanDist > influenceRadius * MANHATTAN_TO_EUCLIDEAN) {
          // If tile has depth, let it settle back to 0
          if (tile.depth > MIN_VISIBLE_DEPTH || tile.targetDepth > MIN_VISIBLE_DEPTH) {
            tile.targetDepth = 0;
            tile.depth += (tile.targetDepth - tile.depth) * LERP_SPEED;
          }
          continue;
        }
        
        // Only calculate expensive square root if within potential range
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);
        
        // Calculate target depth based on distance
        if (distance < influenceRadius) {
          const influence = 1 - distance / influenceRadius;
          tile.targetDepth = influence * maxDepth;
        } else {
          tile.targetDepth = 0;
        }
        
        // Smooth interpolation
        tile.depth += (tile.targetDepth - tile.depth) * LERP_SPEED;
      }
      
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
        influenceRadius
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
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black touch-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10 text-cyan-400 font-mono">
        <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2" style={{ textShadow: '0 0 10px rgba(0, 200, 255, 0.8)' }}>
          Isometric Grid
        </h1>
        <p className="text-xs md:text-sm opacity-70">Move to interact</p>
      </div>
    </main>
  );
}