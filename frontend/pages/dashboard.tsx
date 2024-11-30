import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navigation Bar - Mobile Friendly */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="flex flex-wrap justify-center gap-2 p-4 md:gap-4 md:p-6">
          <Link 
            href="/text-to-image" 
            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                     rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Text to Image
          </Link>
          
          <Link 
            href="/image-to-video" 
            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                     rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Image to Video
          </Link>
          
          <Link 
            href="/text-to-video" 
            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                     rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Text to Video
          </Link>
          
          <Link 
            href="/gallery" 
            className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                     rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Gallery
          </Link>
        </div>
      </nav>

      {/* Main Content - Adjusted to prevent overlap with nav */}
      <div className="pt-[80px] md:pt-[100px]"> {/* Add padding to prevent overlap */}
        <Link href="/text-to-image" className="relative h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] w-full group cursor-pointer snap-start">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover md:object-center object-[70%]"
          >
            <source src="/cyberpunk girl1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50 md:bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 md:px-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white text-center group-hover:scale-110 transition-transform duration-300 mb-4 md:mb-6">
              Text to Image Generation
            </h2>
            <p className="text-white/90 text-center max-w-3xl text-base md:text-xl lg:text-2xl px-4">
              Create stunning images using our integrated AI models including Stable Diffusion XL, 
              Stable Diffusion 3.5, Flux Models, and more.
            </p>
          </div>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <Link href="/login">
          <button className="px-8 py-4 md:py-3 text-white border-2 md:border border-white rounded-lg 
                            transition-all duration-300 hover:bg-white/10 active:bg-white/20 
                            w-[200px] text-lg md:text-base">
            Log Out
          </button>
        </Link>
      </div>
    </div>
  );
} 