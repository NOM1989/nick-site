"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { IconX, IconMinus, IconMaximize, IconPlus } from "@tabler/icons-react";
import { ScrollTransformSlide, useScrollFade } from "./components/ScrollTransformSlide";

export default function Home() {
  const fadeOpacity = useScrollFade();

  // Auto-scroll to 15% on page load
  useEffect(() => {
    window.scrollTo({
      top: window.innerHeight * 0.2,
      behavior: 'instant'
    });
  }, []);

  const scrollToSlide1 = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToSlideMid = () => {
    window.scrollTo({
      top: window.innerHeight * 0.2,
      behavior: 'smooth'
    });
  };

  const scrollToSlide2 = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <main className="relative bg-black">
      {/* Slide 1 - Hero Section with CRT Effects */}
      <section className="sticky top-0 h-screen bg-black overflow-hidden">
        {/* Fade overlay that appears on scroll */}
        <div
          className="absolute inset-0 bg-black z-[15] transition-opacity duration-75 ease-out pointer-events-none"
          style={{ opacity: fadeOpacity }}
        />

        {/* CRT Background Effects Applied to First Slide Only */}
        <div className="absolute inset-0 bg-black filter contrast-[1.2] brightness-110 glow-green pointer-events-none">
          <div className="absolute inset-0 z-[1] crt-scanlines" />
          <div className="absolute inset-0 z-[2] crt-curvature" />
          <div className="absolute inset-0 z-[3] crt-flicker" />
        </div>

        {/* First Slide Content */}
        <div className="crt-screen-transform relative z-[10] h-full flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 font-inconsolata text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl glow">
            Nick Michau
          </h1>
          <div className="flex flex-row items-center gap-1 md:gap-2 lg:gap-3 glow">
            <span className="text-sm sm:text-md md:text-lg lg:text-xl">❯</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Software Engineer
            </h2>
          </div>
          <Link
            href="mailto:nick@michau.uk"
            className="relative z-[20] text-xl sm:text-2xl md:text-3xl lg:text-4xl glow hover:text-blue-300 hover:brightness-110 break-all sm:break-normal transition-colors duration-200 cursor-pointer"
          >
            nick@michau.uk
          </Link>
        </div>
      </section>

      {/* Slide 2 - Coming Soon */}
      <section className="sticky top-0 h-screen flex flex-col items-center justify-center text-center font-inconsolata glow">
        <ScrollTransformSlide className="w-full h-full flex flex-col items-center text-center space-y-8 p-16 pt-32">
          {/* Application Window Controls */}
          <div className="absolute top-6 left-6 flex space-x-3 z-20">
            <button
              onClick={scrollToSlide1}
              className="relative w-4 h-4 bg-red-500 rounded-full shadow-sm hover:bg-red-400 transition-all duration-200 cursor-pointer group flex items-center justify-center"
              aria-label="Go to slide 1"
            >
              <IconX
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-800 stroke-3 absolute"
              />
            </button>
            <button
              onClick={scrollToSlideMid}
              className="relative w-4 h-4 bg-yellow-500 rounded-full shadow-sm hover:bg-yellow-400 transition-all duration-200 cursor-pointer group flex items-center justify-center"
              aria-label="Go to slide 1"
            >
              <IconMinus
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-800 stroke-3 absolute"
              />
            </button>
            <button
              onClick={scrollToSlide2}
              className="relative w-4 h-4 bg-green-500 rounded-full shadow-sm hover:bg-green-400 transition-all duration-200 cursor-pointer group flex items-center justify-center"
              aria-label="Go to slide 2"
            >
              <IconPlus
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-800 stroke-3 absolute"
              />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
              <Image
                src="/nick-cutout.png"
                alt="Nick Michau"
                fill
                className="object-contain filter brightness-90 contrast-110"
                priority
              />
            </div>

            <div className="w-64 md:w-80 lg:w-96 border-b-2 border-white"></div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl">Living and learning on the cutting edge.</h1>
          </div>
        </ScrollTransformSlide>
      </section>
    </main>
  );
}