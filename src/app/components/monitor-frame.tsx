"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface MonitorFrameProps {
  children?: ReactNode
  className?: string
  screenClassName?: string
  imageSrc?: string
  imageAlt?: string
  imageClassName?: string
}

export default function MonitorFrame({ 
  children, 
  className, 
  screenClassName,
  imageSrc,
  imageAlt = "Monitor display",
  imageClassName
}: MonitorFrameProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Monitor Frame */}
      <div className="relative rounded-lg shadow-2xl border-4 border-white/90 h-full">
        {/* Screen Bezel */}
        <div className="relative bg-black p-1 rounded-lg shadow-inner h-full">
          {/* CRT Screen */}
          <div
            className={cn(
              "crt-screen relative overflow-hidden h-full rounded-lg",
              "bg-black filter contrast-[1.2] brightness-110",
              screenClassName,
            )}
          >
            {/* Screen Content */}
            <div className={cn(
              "relative z-10 h-full overflow-hidden",
              "crt-screen-transform"
            )}>
              <div className="crt-content-transform h-full">
                {imageSrc ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className={cn(
                        "object-cover rounded-lg object-top",
                        imageClassName
                      )}
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-full p-6 flex items-center justify-center text-white font-inconsolata">
                    {children || (
                      <div className="text-center space-y-2">
                        <pre className="text-2xl font-bold">{"No Signal"}</pre>
                        <pre className="text-sm opacity-70">{"Please check connection"}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none z-20 crt-scanlines" />

            {/* Screen Curvature Overlay */}
            <div className="absolute inset-0 pointer-events-none z-30 rounded-lg crt-curvature" />

            {/* Subtle flicker effect */}
            <div className="absolute inset-0 pointer-events-none z-40 rounded-lg opacity-5 crt-flicker" />
          </div>
        </div>
      
      </div>
    </div>
  )
}
