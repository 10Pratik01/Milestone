"use client"
import Image from "next/image";
import { useEffect, useState } from "react"
import { Background, Parallax } from 'react-parallax';
import { Features } from "./(components)/LandingUI/Features";
import { HeroSection } from "./(components)/LandingUI/HeroSection";
import { Background3D } from "./(components)/LandingUI/Background";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"


export default function Home() {  

  return (
     <div className="relative w-full overflow-x-hidden bg-background">
      <section className="relative h-100 w-full flex flex-col overflow-hidden">
        <div className={` h-[120vh] w-full flex flex-col  overflow-hidden select-none `} >
          <div className="absolute inset-0 w-full h-full overflow-hidden opacity-90 ">
            <div className="absolute top-0 left-0 w-full h-full blur-md scale-120 select-none md:translate-x-35">
              <Background3D />
            </div>
          </div>

          <div className="flex flex-col h-209.5 w-full mx-5 my-2  ">
            {/* Name */}
              <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
             className= "mt-20 w-full pl-20 flex flex-col justify-center items-start ">
                  <h1 className="text-blue-300 text-[50px] w-full md:text-[90px] flex justify-center -translate-x-10 md:-translate-x-5 -mb-2.5 font-semibold">Taskorium</h1>
                  <p className="text-blue-300 font-bold opacity-100 w-full dark:text-blue-300 text-[8px] md:text-[25px] flex justify-center">Your personalized project management plactform</p>
              </motion.div>
          </div>
        </div>
      </section>

    {/* Features section */}
{/* Features section */}
<section className="relative w-full mb-10 md:mb-1  overflow-hidden">
  {/* Slanted divider */}
  <div className="h-1 w-full relative">
    <div className="absolute inset-x-0 top-0 h-16 bg-gray-500 rotate-0 scale-x-110" />
  </div>

  {/* Content */}
  <div className="relative min-h-screen md:min-h-[120vh] lg:min-h-[140vh] flex items-center justify-center bg-white dark:bg-black px-4 md:px-10">
    
    {/* Grid background */}
    <div
      className={cn(
        "absolute inset-0",
        "[background-size:32px_32px] md:[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
      )}
    />

    {/* Mask */}
    <div className="pointer-events-none absolute inset-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)]" />

    {/* Content */}
    <div className="relative z-20 w-full max-w-7xl text-center">
      <h2 className="text-4xl sm:text-5xl md:text-7xl font-semibold underline underline-offset-8 mb-12 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
        Features
      </h2>

      <div className="w-full">
        <Features />
      </div>
    </div>
  </div>
</section>

     


       <div  >
        <div className=" h-20 w-full flex justify-start items-center relative ">
          <div className={`w-full h-30 scale-170 bg-gray-500 rotate-3`} />
        </div>
        <div className="mt-14"/>
        <HeroSection/>
        <div className=" h-20 w-full flex justify-start items-center relative ">
          <div className={`w-full h-30 scale-170 bg-gray-500 rotate-3`} />
        </div>
      </div>

      
      {/* dummy div  */}
      <div className="h-screen border-t border-t-amber-200" />
    </div>
  )
}