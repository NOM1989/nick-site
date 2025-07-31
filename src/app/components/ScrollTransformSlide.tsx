"use client";

import { useEffect, useState } from "react";

interface ScrollTransformSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollTransformSlide({ children, className = "" }: ScrollTransformSlideProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Only apply transform effect on screens larger than md (768px)
      if (window.innerWidth < 768) {
        setScale(1);
        return;
      }

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate when the second slide starts becoming visible
      // The second slide starts at 100vh (after the first slide)
      const slideStartPosition = viewportHeight;
      
      // Calculate scroll progress for the second slide
      // When scrollY >= slideStartPosition, the second slide is at the top
      const progress = Math.min(Math.max((scrollY - slideStartPosition + viewportHeight) / viewportHeight, 0), 1);
      
      // Scale from 90% to 100% based on scroll progress
      const newScale = 0.9 + (0.1 * progress);
      setScale(newScale);
    };

    const handleResize = () => {
      // Re-evaluate on resize
      handleScroll();
    };

    // Set initial scale
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div 
      className={`transition-transform duration-75 ease-out bg-black ${className}`}
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: "center center"
      }}
    >
      {children}
    </div>
  );
}

// Hook to track scroll-based fade effect for the first slide
export function useScrollFade() {
  const [fadeOpacity, setFadeOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Start fading when user scrolls past 20% of the first slide
      // Complete fade when reaching 80% of the first slide
      const fadeStartPoint = viewportHeight * 0.2;
      const fadeEndPoint = viewportHeight * 0.9;
      
      let opacity = 0;
      
      if (scrollY >= fadeStartPoint) {
        // Calculate fade progress between start and end points
        const fadeProgress = Math.min((scrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint), 1);
        opacity = fadeProgress;
      }
      
      setFadeOpacity(opacity);
    };

    const handleResize = () => {
      handleScroll();
    };

    // Set initial opacity
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return fadeOpacity;
}
