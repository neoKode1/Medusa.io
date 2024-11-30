import { useSession, signIn } from "next-auth/react"
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import axios from 'axios';

const Home: NextPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <Head>
          <title>MEDUSA.io - Sign In</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute w-full h-full object-cover z-0"
        >
          <source src="/cyberpunk girl1.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          className="flex items-center gap-3 px-6 py-3 rounded-lg 
                     bg-transparent border border-white text-white
                     hover:bg-white/10 transition-all z-20"
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
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Head>
        <title>MEDUSA.io - AI Image & Video Generation</title>
        <meta name="description" content="AI-powered image and video generation platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute w-full h-full object-cover z-0"
      >
        <source src="/cyberpunk girl1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Main Content */}
      <main className="text-center z-20">
        <h1 className="text-6xl font-bold text-white mb-4">
          MEDUSA.io
        </h1>
        <p className="text-xl text-blue-400 mb-4">
          Powered with Luma Dream Machine along with Flux Black Forest
        </p>
        
        <div className="text-white mb-8">
          <p>Welcome, {session.user?.name}!</p>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 rounded-lg bg-transparent border border-white text-white
                     hover:bg-white/10 transition-all"
        >
          Enter
        </button>
      </main>
    </div>
  )
}

const handleSignIn = async () => {
  try {
    console.log('Attempting sign in...');
    await signIn('google', { callbackUrl: '/dashboard' });
  } catch (error) {
    console.error('Sign in error:', error);
    // Log to server
    await axios.post('/api/auth/log', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }).catch(console.error);
  }
};

export default Home 