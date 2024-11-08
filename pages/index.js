import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>medusa.io</title>
      </Head>

      <main className="relative flex flex-col min-h-screen">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/brok1.png"
            alt="Cyberpunk background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center justify-center flex-grow text-center text-white p-8">
          {/* Title and Subtitle */}
          <div className="mb-12">
            <h1 className="text-8xl font-bold">MEDSUSA.io</h1>
            <p className="text-2xl mt-4">Powered with Luma Dream Machine along with Flux Black Forest</p>
          </div>

          {/* Google Sign In Button */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-4 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Image
              src="/google-icon.svg"
              alt="Google"
              width={24}
              height={24}
            />
            <span className="font-medium">Sign in with Google</span>
          </Link>
        </div>
      </main>
    </>
  );
}
