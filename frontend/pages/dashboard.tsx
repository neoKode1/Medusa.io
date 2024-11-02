import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize client-side storage on mount
  useEffect(() => {
    // Clear storage on component unmount (logout)
    return () => {
      localStorage.clear();
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Menu Button - Adjusted z-index to stay on top */}
      <div className="fixed top-8 left-8 z-50">
        <button
          onClick={toggleDropdown}
          className="px-4 py-2 text-white rounded-lg transition-colors flex items-center border border-white hover-glow"
        >
          Menu
          <ChevronDown className="ml-2" />
        </button>

        {showDropdown && (
          <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
            <li>
              <Link href="/dashboard" className="block px-4 py-2 text-black hover:bg-gray-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/image-to-video" className="block px-4 py-2 text-black hover:bg-gray-200">
                Image to Video
              </Link>
            </li>
            <li>
              <Link href="/TextToImagePage" className="block px-4 py-2 text-black hover:bg-gray-200">
                Text to Image
              </Link>
            </li>
            <li>
              <Link href="/generate-prompt" className="block px-4 py-2 text-black hover:bg-gray-200">
                Generate Prompt
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* Three Sections - Adjusted heights */}
      <Link href="/generate-prompt" className="relative h-screen w-full group cursor-pointer snap-start">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/cyberpunk girl1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white text-center group-hover:scale-110 transition-transform duration-300 mb-6">
            Generate AI Prompts
          </h2>
          <p className="text-white/90 text-center max-w-3xl text-lg md:text-xl lg:text-2xl">
            Create powerful, detailed prompts for your AI generations. Enhance your prompts with references from movies, books, 
            and various artistic styles. Perfect for both image and video generations.
          </p>
        </div>
      </Link>

      <Link href="/image-to-video" className="relative h-screen w-full group cursor-pointer snap-start">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/leena.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white text-center group-hover:scale-110 transition-transform duration-300 mb-6">
            Image to Video Generation
          </h2>
          <p className="text-white/90 text-center max-w-3xl text-lg md:text-xl lg:text-2xl">
            Transform still images into dynamic videos using advanced AI models including LumaAI, AnimateDiff, 
            and Motion Transfer. Create stunning animations, motion effects, and video content from your images 
            with customizable parameters and styles.
          </p>
        </div>
      </Link>

      <Link href="/TextToImagePage" className="relative h-screen w-full group cursor-pointer snap-start">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/anniemae.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white text-center group-hover:scale-110 transition-transform duration-300 mb-6">
            Text to Image Generation
          </h2>
          <p className="text-white/90 text-center max-w-3xl text-lg md:text-xl lg:text-2xl">
            Create stunning images from text descriptions using state-of-the-art AI models including Stable Diffusion, 
            DALL·E 3, Midjourney, and more. Features advanced options like style selection, aspect ratio control, 
            and reference image uploads for enhanced results.
          </p>
        </div>
      </Link>

      {/* Disclaimer Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white/80 py-4 px-6 text-sm z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">
            Note: Generated content is temporarily stored locally and will be cleared upon logout. 
            Enhanced cloud storage coming soon with user profiles.
          </p>
          
          <div className="flex items-center gap-4">
            <p className="text-sm">Follow us:</p>
            <div className="flex gap-3">
              <a 
                href="https://github.com/neoKode1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor" className="w-5 h-5">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
                </svg>
              </a>
              <a 
                href="https://deep-tech-ai.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                DeepTech AI
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          scroll-snap-type: y mandatory;
        }
      `}</style>
    </div>
  );
} 