"use client";

import React from "react";
import Image from "next/image";
import Nav from "~~/components/Nav";

const HomePage = () => {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex flex-col gap-6">
        <Nav />
        <main className="flex-1 relative flex justify-center items-center w-screen">
          {/* Left Decorative Images */}
          <div className="absolute left-0 h-full w-32 flex flex-col gap-6">
            <div className="w-30 h-30 z-10">
              <Image src="laughing woman.svg" alt="Wrecked Love" width={110} height={110} />
            </div>
            <div className="w-30 h-30">
              <Image src="young man in a hat.svg" alt="Wrecked Love" width={110} height={110} />
            </div>
            <div className="w-30 h-30">
              <Image src="young man.svg" alt="Wrecked Love" width={110} height={110} />
            </div>
            <div className="w-40 h-40">
              <Image src="thoughtful man.svg" alt="Wrecked Love" width={130} height={110} />
            </div>
          </div>

          {/* Right Decorative Images */}
          <div className="absolute right-0 h-full w-fit flex flex-col">
            <div className="w-32 h-36 z-10">
              <Image src="young woman with curly hair.svg" alt="Wrecked Love" width={125} height={110} />
            </div>
            <div className="w-32 h-36">
              <Image src="curly haired man in a hat.svg" alt="Wrecked Love" width={125} height={110} />
            </div>
            <div className="w-32 h-36">
              <Image src="woman with a mole.svg" alt="Wrecked Love" width={125} height={110} />
            </div>
            <div className="w-32 h-36">
              <Image src="man with earring.svg" alt="Wrecked Love" width={125} height={110} />
            </div>
          </div>

          {/* Center Hero Section */}
          <div className="flex flex-col items-center justify-center gap-14 px-32 relative z-20">
            <div className="flex flex-col">
              {/* Tagline */}
              <div className="relative leading-none w-fit">
                <h1 className="relative z-10 text-7xl text-black font-kranky">Wrecked Love</h1>
                <h1
                  aria-hidden="true"
                  className="absolute inset-0 text-7xl font-bold text-[#55b6ca92] font-kreon translate-x-1 translate-y-1 pointer-events-none"
                >
                  Wrecked Love
                </h1>
              </div>
              <p>xhshdjedkj</p>
            </div>
            {/* Hero Image Carousel */}
            <div className="relative w-full h-96 flex flex-col">
              <div className="w-full h-full flex items-center justify-center">
                <Image src="Marriage proposal.svg" alt="hero images" width={600} height={600} />
              </div>
              {/* Bottom Arc */}
              <div className=" relative w-full h-full">
                <Image
                  src="Ellipse 1.svg"
                  alt="Wrecked Love"
                  width={3000}
                  height={3000}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
