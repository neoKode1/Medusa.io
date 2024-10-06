import Head from 'next/head';
import Image from 'next/image';
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

      <main className="flex flex-col min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-start mb-12">
          <h1 className="text-8xl font-bold text-gray-800">MEDSUSA.io</h1>
          <Image
            src="/medusa_art-removebg-preview-modified.png"
            alt="Medusa art"
            width={200}
            height={200}
            className="ml-4"
            priority
          />
        </div>

        {/* Dropdown Menu for Navigation */}
        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Menu
          </button>
          {isDropdownOpen && (
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
              <li>
                <Link href="index.js" className="block px-4 py-2 hover:bg-gray-200">
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
                <Link href="/AnotherPage" className="block px-4 py-2 hover:bg-gray-200">
                  Another Page
                </Link>
              </li>
            </ul>
          )}
        </div>

        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="relative w-[384px] h-[384px] mb-8">
            <video 
              src="cyberpunk girl1.mp4"
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          <Link href="/ImageToVideoPage" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Generate
          </Link>
        </div>
      </main>
    </>
  );
}
