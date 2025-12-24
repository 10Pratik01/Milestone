"use client"
import Image from "next/image";
import { useEffect, useState } from "react"
import { Background, Parallax } from 'react-parallax';

export default function Home() {  

  return (
    <div className="">
      {/* Heading */}
      <div className={` h-[90vh] w-full flex flex-col overflow-hidden `} >
        <div className=" h-20 w-full flex justify-start items-center relative">
          <div className={`w-full h-30 scale-170 bg-gray-500 rotate-3`} />
        </div>
        <div className=" h-full w-full mx-5 my-2 flex">
          {/* Name */}
            <div className="h-full w-[50%] pl-20 flex flex-col justify-center items-start translate-y-[-50px] transition-all">
                <h1 className="text-[90px] flex justify-start -translate-x-5 -mb-2.5 font-semibold">Taskorium</h1>
                <p className="text-gray-400 text-[15px] flex justify-start">Your personalized project management plactform</p>
            </div>
          {/* Image */}
          <div className="h-full w-[60%] z-20 flex justify-center items-center " >
              <Parallax className="w-full h-full flex items-center justify-center" strength={100}>
                 <Background className="h-100 w-220">
                   <Image src='/page1.png' alt="thi"  width={700} height={700}/>
                 </Background>
              </Parallax>
          </div>
        </div>
        <div className=" h-20 w-full flex justify-start items-center relative ">
          <div className={`w-full h-30 scale-170 bg-gray-500 rotate-3`} />
        </div>
      </div>

    {/* Features section */}
      <div className="h-scree w-full overflow-hidden">
        <div className=" h-20 w-full flex justify-start items-center relative ">
          <div className={`w-full h-30 scale-170 bg-gray-500 rotate-3 `} />
        </div>
          {/* Features heading  */}
        <div className="text-[100px] relative z-20 -translate-y-5 font-semibold underline underline-offset-10 flex justify-center">Features</div>
        
        <div className="flex flex-wrap">

        </div>

      </div>



      {/* dummy div  */}
      <div className="h-screen border-t border-t-amber-200" />
    </div>
  )
}