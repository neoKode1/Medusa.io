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

      {/* Background image option (add your background image to the public folder if needed) */}
      <main className="flex flex-col min-h-screen bg-black p-8 bg-cover bg-center" style={{ backgroundImage: "url('/Medusa.svg.png')" }}>
        <div className="flex flex-col items-center justify-center flex-grow">
          {/* Title and Subtitle */}
          <div className="text-center">
            <h1 className="text-8xl font-bold text-white mb-4">MEDSUSA.io</h1>
            <p className="text-white text-2xl">Powered by Luma Dream Machine AI</p>
          </div>

          {/* Dropdown Menu for Navigation */}
          <div className="relative mt-8">
            <button
              onClick={toggleDropdown}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Menu
            </button>
            {isDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
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

          {/* Video Display */}
          <div className="relative w-[384px] h-[384px] my-8">
            <video 
              src="cyberpunk girl1.mp4"
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>

          {/* Generate Button */}
          <Link href="/ImageToVideoPage" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Generate
          </Link>
        </div>
      </main>
    </>
  );
}
