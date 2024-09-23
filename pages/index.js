// pages/index.js

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
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
