import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <Head>
        <title>medusa.io</title>
      </Head>

      {/* Background video */}
      <main className="relative flex flex-col min-h-screen">
        
        {/* Fullscreen background video */}
        <video
          src="/cyberpunk girl1.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Overlay to darken the background video slightly for readability */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

        {/* Content over the video */}
        <div className="relative z-20 flex flex-col items-center justify-center flex-grow text-center text-white p-8">
          
          {/* Title and Subtitle */}
          <div className="mb-8">
            <h1 className="text-8xl font-bold">MEDSUSA.io</h1>
            <p className="text-2xl">Powered with Luma Dream Machine along with Flux Black Forest</p>
          </div>

          {/* Dropdown Menu for Navigation */}
          <div className="relative mt-8 ">
            <button
              onClick={toggleDropdown}
              className="px-6 py-3 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition-colors"
            >
              Menu
            </button>
            {isDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-48 bg-white text-black shadow-lg rounded-lg z-30">
                <li>
                  <Link href="/" className="block px-4 py-2 hover:bg-gray-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/ImageToVideoPage" className="block px-4 py-2 hover:bg-gray-200">
                    Image to Video
                  </Link>
                </li>
                <li>
                  <Link href="/TextToImagePage" className="block px-4 py-2 hover:bg-gray-200">
                    Text to Image
                  </Link>
                </li>
                <li>
                  <Link href="/generate-prompt" className="block px-4 py-2 hover:bg-gray-200">
                    Generate Prompt
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Generate Button */}
          <Link href="/ImageToVideoPage" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-8">
            Generate
          </Link>
        </div>
      </main>
    </>
  );
}
