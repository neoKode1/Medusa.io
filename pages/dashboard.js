import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Twitter, Github } from 'lucide-react';

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
              <Link href="/ImageToVideoPage" className="block px-4 py-2 text-black hover:bg-gray-200">
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

      <Link href="/ImageToVideoPage" className="relative h-screen w-full group cursor-pointer snap-start">
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
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/JusChadneo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/io2Medusa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
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