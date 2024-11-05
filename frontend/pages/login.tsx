import { signIn } from "next-auth/react"
import Head from 'next/head'
import Image from 'next/image'
import type { NextPage } from 'next'

const Login: NextPage = () => {
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
        className="absolute w-full h-full object-cover z-0"
      >
        <source src="/cyberpunk girl1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Sign In Button */}
      <button
        onClick={() => signIn('google')}
        className="flex items-center gap-3 px-6 py-3 rounded-lg 
                   bg-transparent border border-white text-white
                   hover:bg-white/10 transition-all z-20"
      >
        <Image
          src="/google-icon.svg"
          alt="Google Logo"
          width={20}
          height={20}
        />
        Sign in with Google
      </button>
    </div>
  )
}

export default Login
