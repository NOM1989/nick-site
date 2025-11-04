'use client';

import { useEffect, useRef } from 'react';

// Constants for isometric projection and animation
const ISO_COS_30 = 0.866;
const ISO_SIN_30 = 0.5;
const LERP_SPEED = 0.15;
const MIN_VISIBLE_DEPTH = 0.1;
const MANHATTAN_TO_EUCLIDEAN = 1.4;
const MAX_TILES = 800;

// TypedArray indices for tile data - better memory layout and cache performance
const enum TileIndex {
  X = 0,
  Y = 1,
  DEPTH = 2,
  TARGET_DEPTH = 3,
  SIZE = 4
}

interface GridParams {
  readonly tileSize: number;
  readonly maxDepth: number;
  readonly influenceRadius: number;
}

export default function IsometricPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesDataRef = useRef<Float32Array>(new Float32Array(0));
  const tileCountRef = useRef<number>(0);
  const tileMapRef = useRef<Map<string, number>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const gridParamsRef = useRef<GridParams>({ 
    tileSize: 100, 
    maxDepth: 120, 
    influenceRadius: 150 
  });
  
  // Pre-computed color arrays for performance
  const colorCacheRef = useRef<{
    topColors: string[];
    sideColors: string[];
  }>({ topColors: [], sideColors: [] });
  
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

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Calculate responsive parameters
    const calculateParams = () => {
      const width = window.innerWidth;
      
      let tileSize: number, maxDepth: number, influenceRadius: number;
      
      if (width < 480) {
        tileSize = 60; maxDepth = 80; influenceRadius = 100;
      } else if (width < 768) {
        tileSize = 70; maxDepth = 100; influenceRadius = 120;
      } else if (width < 1024) {
        tileSize = 80; maxDepth = 110; influenceRadius = 140;
      } else {
        tileSize = 90; maxDepth = 120; influenceRadius = 150;
      }
      
      gridParamsRef.current = { tileSize, maxDepth, influenceRadius };
      
      // Pre-compute color arrays for all depth levels
      const topColors: string[] = [];
      const sideColors: string[] = [];
      for (let i = 0; i <= maxDepth; i++) {
        const brightness = Math.max(0.1, 1 - (i / maxDepth) * 0.7);
        const g = Math.floor(100 * brightness);
        const b = Math.floor(150 * brightness);
        topColors[i] = `rgba(0,${g},${b},0.7)`;
        
        const sg = Math.floor(50 * brightness);
        const sb = Math.floor(90 * brightness);
        sideColors[i] = `rgba(0,${sg},${sb},0.85)`;
      }
      colorCacheRef.current = { topColors, sideColors };
      
      return { tileSize, maxDepth, influenceRadius };
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const params = calculateParams();
      
      // Update cache
      const cache = cacheRef.current;
      cache.centerX = canvas.width / 2;
      cache.centerY = canvas.height / 2;
      cache.isoWidthMultiplier = params.tileSize * ISO_COS_30;
      cache.isoHeightMultiplier = params.tileSize * ISO_SIN_30;
      cache.canvasWidth = canvas.width;
      cache.canvasHeight = canvas.height;
      
      // Create viewport-optimized tile layout
      const viewportWidth = canvas.width;
      const viewportHeight = canvas.height;
      const margin = params.tileSize * 2;
      
      const isoWidth = cache.isoWidthMultiplier;
      const isoHeight = cache.isoHeightMultiplier;
      const { centerX, centerY } = cache;
      
      // Transform viewport corners to grid space
      const corners = [
        { sx: -margin, sy: -margin },
        { sx: viewportWidth + margin, sy: -margin },
        { sx: viewportWidth + margin, sy: viewportHeight + margin },
        { sx: -margin, sy: viewportHeight + margin }
      ];
      
      let minSum = Infinity, maxSum = -Infinity;
      let minDiff = Infinity, maxDiff = -Infinity;
      
      for (let i = 0; i < 4; i++) {
        const corner = corners[i];
        const sx = corner.sx - centerX;
        const sy = corner.sy - centerY;
        
        const sumValue = sy / isoHeight;
        const diffValue = sx / isoWidth;
        
        minSum = Math.min(minSum, sumValue);
        maxSum = Math.max(maxSum, sumValue);
        minDiff = Math.min(minDiff, diffValue);
        maxDiff = Math.max(maxDiff, diffValue);
      }
      
      const sumStart = Math.floor(minSum);
      const sumEnd = Math.ceil(maxSum);
      const diffStart = Math.floor(minDiff);
      const diffEnd = Math.ceil(maxDiff);
      
      // Pre-allocate TypedArray
      const estimatedTiles = Math.min((sumEnd - sumStart) * (diffEnd - diffStart) / 2, MAX_TILES);
      tilesDataRef.current = new Float32Array(estimatedTiles * TileIndex.SIZE);
      
      const tileMap = new Map<string, number>();
      let tileCount = 0;
      
      // Generate tiles with parity handling
      outerLoop: for (let sum = sumStart; sum <= sumEnd; sum++) {
        for (let diff = diffStart; diff <= diffEnd; diff++) {
          if ((sum + diff) % 2 === 0) {
            const x = (sum + diff) / 2;
            const y = (sum - diff) / 2;
            
            const idx = tileCount * TileIndex.SIZE;
            tilesDataRef.current[idx + TileIndex.X] = x;
            tilesDataRef.current[idx + TileIndex.Y] = y;
            tilesDataRef.current[idx + TileIndex.DEPTH] = 0;
            tilesDataRef.current[idx + TileIndex.TARGET_DEPTH] = 0;
            
            tileMap.set(`${x},${y}`, tileCount);
            tileCount++;
            
            if (tileCount >= MAX_TILES) break outerLoop;
          }
        }
      }
      
      tileCountRef.current = tileCount;
      tileMapRef.current = tileMap;
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Mouse and touch handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Inline screen coordinate conversion for performance
    const toScreenX = (x: number, y: number): number => {
      return cacheRef.current.centerX + (x - y) * cacheRef.current.isoWidthMultiplier;
    };
    
    const toScreenY = (x: number, y: number, depth: number): number => {
      return cacheRef.current.centerY + (x + y) * cacheRef.current.isoHeightMultiplier + depth;
    };

    // Optimized tile drawing with inlined visibility check
    const drawTile = (idx: number) => {
      const tilesData = tilesDataRef.current;
      const offset = idx * TileIndex.SIZE;
      
      const x = tilesData[offset + TileIndex.X];
      const y = tilesData[offset + TileIndex.Y];
      const depth = tilesData[offset + TileIndex.DEPTH];
      
      // Inline visibility check
      const cache = cacheRef.current;
      const isoX = (x - y) * cache.isoWidthMultiplier;
      const isoY = (x + y) * cache.isoHeightMultiplier;
      const screenX = cache.centerX + isoX;
      const screenY = cache.centerY + isoY;
      
      const margin = gridParamsRef.current.tileSize * 1.5;
      if (screenX < -margin || screenX > cache.canvasWidth + margin ||
          screenY < -margin || screenY > cache.canvasHeight + margin) {
        return;
      }
      
      // Calculate corners once
      const topX = toScreenX(x, y);
      const topY = toScreenY(x, y, depth);
      const rightX = toScreenX(x + 1, y);
      const rightY = toScreenY(x + 1, y, depth);
      const bottomX = toScreenX(x + 1, y + 1);
      const bottomY = toScreenY(x + 1, y + 1, depth);
      const leftX = toScreenX(x, y + 1);
      const leftY = toScreenY(x, y + 1, depth);
      
      // Top face
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(rightX, rightY);
      ctx.lineTo(bottomX, bottomY);
      ctx.lineTo(leftX, leftY);
      ctx.closePath();
      
      // Use pre-computed colors
      const depthIndex = Math.floor(depth);
      ctx.fillStyle = colorCacheRef.current.topColors[depthIndex] || colorCacheRef.current.topColors[0];
      ctx.fill();
      
      const brightness = Math.max(0.1, 1 - (depth / gridParamsRef.current.maxDepth) * 0.7);
      ctx.strokeStyle = `rgba(0,200,255,${0.6 * brightness})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw side faces if depth > 2
      if (depth > 2) {
        const tileMap = tileMapRef.current;
        
        // Helper to get neighbor depth
        const getDepth = (nx: number, ny: number): number => {
          const nidx = tileMap.get(`${nx},${ny}`);
          if (nidx === undefined) return 0;
          return tilesData[nidx * TileIndex.SIZE + TileIndex.DEPTH];
        };
        
        const topDepth = getDepth(x, y - 1);
        const rightDepth = getDepth(x + 1, y);
        const leftDepth = getDepth(x, y + 1);
        const topLeftDepth = getDepth(x - 1, y);
        
        const sideColor = colorCacheRef.current.sideColors[depthIndex] || colorCacheRef.current.sideColors[0];
        
        // Right face
        if (depth > rightDepth + 1) {
          const trsx = toScreenX(x + 1, y);
          const trsy = toScreenY(x + 1, y, rightDepth);
          const brsx = toScreenX(x + 1, y + 1);
          const brsy = toScreenY(x + 1, y + 1, rightDepth);
          
          ctx.beginPath();
          ctx.moveTo(rightX, rightY);
          ctx.lineTo(trsx, trsy);
          ctx.lineTo(brsx, brsy);
          ctx.lineTo(bottomX, bottomY);
          ctx.closePath();
          ctx.fillStyle = sideColor;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,150,200,${0.5 * brightness})`;
          ctx.stroke();
        }
        
        // Bottom face
        if (depth > leftDepth + 1) {
          const blsx = toScreenX(x, y + 1);
          const blsy = toScreenY(x, y + 1, leftDepth);
          const brsx = toScreenX(x + 1, y + 1);
          const brsy = toScreenY(x + 1, y + 1, leftDepth);
          
          ctx.beginPath();
          ctx.moveTo(leftX, leftY);
          ctx.lineTo(blsx, blsy);
          ctx.lineTo(brsx, brsy);
          ctx.lineTo(bottomX, bottomY);
          ctx.closePath();
          ctx.fillStyle = sideColor;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,120,180,${0.4 * brightness})`;
          ctx.stroke();
        }
        
        // Top face wall
        if (depth > topDepth + 1) {
          const tlsx = toScreenX(x, y);
          const tlsy = toScreenY(x, y, topDepth);
          const trsx = toScreenX(x + 1, y);
          const trsy = toScreenY(x + 1, y, topDepth);
          
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.lineTo(tlsx, tlsy);
          ctx.lineTo(trsx, trsy);
          ctx.lineTo(rightX, rightY);
          ctx.closePath();
          ctx.fillStyle = sideColor;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,170,220,${0.6 * brightness})`;
          ctx.stroke();
        }
        
        // Left face
        if (depth > topLeftDepth + 1) {
          const tlsx = toScreenX(x, y);
          const tlsy = toScreenY(x, y, topLeftDepth);
          const blsx = toScreenX(x, y + 1);
          const blsy = toScreenY(x, y + 1, topLeftDepth);
          
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.lineTo(tlsx, tlsy);
          ctx.lineTo(blsx, blsy);
          ctx.lineTo(leftX, leftY);
          ctx.closePath();
          ctx.fillStyle = sideColor;
          ctx.fill();
          ctx.strokeStyle = `rgba(0,180,230,${0.65 * brightness})`;
          ctx.stroke();
        }
      }
    };

    // Main animation loop
    const animate = () => {
      const { influenceRadius, maxDepth, tileSize } = gridParamsRef.current;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const tilesData = tilesDataRef.current;
      const tileCount = tileCountRef.current;
      const cache = cacheRef.current;
      
      // Single-pass update and draw
      for (let i = 0; i < tileCount; i++) {
        const offset = i * TileIndex.SIZE;
        const x = tilesData[offset + TileIndex.X];
        const y = tilesData[offset + TileIndex.Y];
        const depth = tilesData[offset + TileIndex.DEPTH];
        const targetDepth = tilesData[offset + TileIndex.TARGET_DEPTH];
        
        // Skip invisible tiles at rest
        if (depth < MIN_VISIBLE_DEPTH && targetDepth < MIN_VISIBLE_DEPTH) {
          const isoX = (x - y) * cache.isoWidthMultiplier;
          const isoY = (x + y) * cache.isoHeightMultiplier;
          const screenX = cache.centerX + isoX;
          const screenY = cache.centerY + isoY;
          const margin = tileSize * 1.5;
          
          if (screenX < -margin || screenX > cache.canvasWidth + margin ||
              screenY < -margin || screenY > cache.canvasHeight + margin) {
            continue;
          }
        }
        
        // Update depth
        const screenPosX = cache.centerX + (x + 0.5 - y - 0.5) * cache.isoWidthMultiplier;
        const screenPosY = cache.centerY + (x + 0.5 + y + 0.5) * cache.isoHeightMultiplier;
        const dx = mouseX - screenPosX;
        const dy = mouseY - screenPosY;
        const manhattanDist = Math.abs(dx) + Math.abs(dy);
        
        if (manhattanDist > influenceRadius * MANHATTAN_TO_EUCLIDEAN) {
          tilesData[offset + TileIndex.TARGET_DEPTH] = 0;
          tilesData[offset + TileIndex.DEPTH] += (0 - depth) * LERP_SPEED;
        } else {
          const distanceSquared = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSquared);
          
          if (distance < influenceRadius) {
            const influence = 1 - distance / influenceRadius;
            tilesData[offset + TileIndex.TARGET_DEPTH] = influence * maxDepth;
          } else {
            tilesData[offset + TileIndex.TARGET_DEPTH] = 0;
          }
          
          const newTargetDepth = tilesData[offset + TileIndex.TARGET_DEPTH];
          tilesData[offset + TileIndex.DEPTH] += (newTargetDepth - depth) * LERP_SPEED;
        }
        
        // Draw tile
        drawTile(i);
      }
      
      // Mouse glow effect
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, influenceRadius);
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
