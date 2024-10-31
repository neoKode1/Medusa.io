import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Twitter, Github } from 'lucide-react';
import type { NextPage } from 'next';

const Dashboard: NextPage = () => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      localStorage.clear();
    };
  }, []);

  const toggleDropdown = (): void => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Menu Button - Adjusted z-index to stay on top */}
      <div className="fixed left-8 top-8 z-50">
        <button
          onClick={toggleDropdown}
          className="hover-glow flex items-center rounded-lg border border-white px-4 py-2 text-white transition-colors"
        >
          Menu
          <ChevronDown className="ml-2" />
        </button>

        {showDropdown && (
          <ul className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg">
            <li>
              <Link href="/dashboard" className="block px-4 py-2 text-black hover:bg-gray-200">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/ImageToVideoPage"
                className="block px-4 py-2 text-black hover:bg-gray-200"
              >
                Image to Video
              </Link>
            </li>
            <li>
              <Link
                href="/TextToImagePage"
                className="block px-4 py-2 text-black hover:bg-gray-200"
              >
                Text to Image
              </Link>
            </li>
            <li>
              <Link
                href="/generate-prompt"
                className="block px-4 py-2 text-black hover:bg-gray-200"
              >
                Generate Prompt
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* Three Sections - Adjusted heights */}
      <Link
        href="/generate-prompt"
        className="group relative h-screen w-full cursor-pointer snap-start"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/cyberpunk girl1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 md:px-8">
          <h2 className="mb-6 text-center text-5xl font-bold text-white transition-transform duration-300 group-hover:scale-110 md:text-6xl">
            Generate AI Prompts
          </h2>
          <p className="max-w-3xl text-center text-lg text-white/90 md:text-xl lg:text-2xl">
            Create powerful, detailed prompts for your AI generations. Enhance your prompts with
            references from movies, books, and various artistic styles. Perfect for both image and
            video generations.
          </p>
        </div>
      </Link>

      <Link
        href="/ImageToVideoPage"
        className="group relative h-screen w-full cursor-pointer snap-start"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/leena.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 md:px-8">
          <h2 className="mb-6 text-center text-5xl font-bold text-white transition-transform duration-300 group-hover:scale-110 md:text-6xl">
            Image to Video Generation
          </h2>
          <p className="max-w-3xl text-center text-lg text-white/90 md:text-xl lg:text-2xl">
            Transform still images into dynamic videos using advanced AI models including LumaAI,
            AnimateDiff, and Motion Transfer. Create stunning animations, motion effects, and video
            content from your images with customizable parameters and styles.
          </p>
        </div>
      </Link>

      <Link
        href="/TextToImagePage"
        className="group relative h-screen w-full cursor-pointer snap-start"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/anniemae.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 md:px-8">
          <h2 className="mb-6 text-center text-5xl font-bold text-white transition-transform duration-300 group-hover:scale-110 md:text-6xl">
            Text to Image Generation
          </h2>
          <p className="max-w-3xl text-center text-lg text-white/90 md:text-xl lg:text-2xl">
            Create stunning images from text descriptions using state-of-the-art AI models including
            Stable Diffusion, DALL·E 3, Midjourney, and more. Features advanced options like style
            selection, aspect ratio control, and reference image uploads for enhanced results.
          </p>
        </div>
      </Link>

      {/* Disclaimer Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 px-6 py-4 text-sm text-white/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
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
                className="transition-colors hover:text-white"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/JusChadneo"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/io2Medusa"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://deep-tech-ai.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 transition-colors hover:text-blue-300"
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
};

export default Dashboard;
