"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import AnsiText from "./ansi-text"

interface RetroMonitorProps {
  children?: ReactNode
  className?: string
  screenClassName?: string
  asciiArt?: string[]  // Array of lines with ANSI codes
}

export default function Monitor({ 
  children, 
  className, 
  screenClassName,
  asciiArt
}: RetroMonitorProps) {
  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Monitor Frame */}
      <div className="relative rounded-lg shadow-2xl border-4 border-white">
        {/* Screen Bezel */}
        <div className="relative bg-black p-4 rounded-lg shadow-inner">
          {/* CRT Screen */}
          <div
            className={cn(
              "crt-screen relative overflow-hidden aspect-[4/3] min-h-[300px] rounded-lg",
              "bg-black filter contrast-[1.2] brightness-110 glow-green",
              screenClassName,
            )}
          >
            {/* Screen Content */}
            <div className={cn(
              "relative z-10 h-full p-6 overflow-auto text-white",
              "font-inconsolata text-[1.3rem] leading-[1.4]",
              "crt-screen-transform"
            )}>
              <div className="crt-content-transform">
                {children || (asciiArt ? (
                  <div className="whitespace-pre font-mono text-xs leading-tight">
                    {asciiArt.map((line, index) => (
                      <div key={index}>
                        <AnsiText>{line}</AnsiText>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <pre className="text-4xl font-bold mb-4">{"Nick Michau"}</pre>
                    <pre>{"GREETINGS PROFESSOR FALKEN"}</pre>
                    <pre>{"SHALL WE PLAY A GAME?"}</pre>
                    <div className="mt-4">
                      <pre className="inline">
                        {"> "}
                        <span className="animate-pulse">_</span>
                      </pre>
                    </div>
                  </div>
                ))}
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
