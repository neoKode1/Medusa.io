import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Head>
          <title>MEDSUSA.io - Sign In</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Video Background */}
        <video autoPlay loop muted className="absolute z-0 h-full w-full object-cover">
          <source src="/cyberpunk girl1.mp4" type="video/mp4" />
        </video>

        {/* Overlay to ensure button is visible */}
        <div className="absolute inset-0 z-10 bg-black/30"></div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn('google')}
          className="z-20 flex items-center gap-3 rounded-lg border border-white bg-transparent px-6 py-3 text-white transition-all hover:bg-white/10"
        >
          <Image
            src="/google-icon.svg"
            alt="Google Logo"
            width={20}
            height={20}
            className="brightness-0 invert"
          />
          Sign in with Google
        </button>
      </div>
    );
  }

  // Rest of your authenticated content remains the same
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Head>
        <title>MEDSUSA.io - AI Image & Video Generation</title>
        <meta name="description" content="AI-powered image and video generation platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Video Background */}
      <video autoPlay loop muted className="absolute z-0 h-full w-full object-cover">
        <source src="/cyberpunk girl1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black/30"></div>

      {/* Main Content */}
      <main className="z-20 text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">MEDSUSA.io</h1>
        <p className="mb-4 text-xl text-blue-400">
          Powered with Luma Dream Machine along with Flux Black Forest
        </p>

        <div className="mb-8 text-white">
          <p>Welcome, {session.user.name}!</p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-lg border border-white bg-transparent px-8 py-3 text-white transition-all hover:bg-white/10"
        >
          Enter
        </button>
      </main>
    </div>
  );
};

export default Home;
