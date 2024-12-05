import { useSession, signOut } from "next-auth/react"
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { NextPage } from 'next'
import Link from 'next/link';

const Dashboard: NextPage = () => {
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
    router.push('/')
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-black">
      {/* Minimal Navigation Bar */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
        <div className="flex flex-wrap gap-2 p-2 rounded-lg backdrop-blur-sm bg-black/20 max-w-[90%] justify-center">
          <Link 
            href="/MedusaPage" 
            className="px-3 py-2 text-xs sm:text-sm text-white/90 rounded-lg hover:bg-white/10 
                     transition-all duration-300 hover:text-white whitespace-nowrap"
          >
            Text to Image
          </Link>
          
          <Link 
            href="/MedusaVideoPage" 
            className="px-4 py-2 text-sm text-white/90 rounded-lg hover:bg-white/10 
                     transition-all duration-300 hover:text-white"
          >
            Video Generation
          </Link>
          
          <Link 
            href="/character-training" 
            className="px-4 py-2 text-sm text-white/90 rounded-lg hover:bg-white/10 
                     transition-all duration-300 hover:text-white"
          >
            Character Training
          </Link>
          
          <Link 
            href="/gallery" 
            className="px-4 py-2 text-sm text-white/90 rounded-lg hover:bg-white/10 
                     transition-all duration-300 hover:text-white"
          >
            Gallery
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-screen">
        <section className="h-full relative">
          <Link href="/MedusaPage" className="block h-full w-full relative group">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/promo.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white text-center group-hover:scale-110 transition-transform duration-500 mb-4">
                Welcome to Medusa.io
              </h1>
              <p className="text-white/90 text-center max-w-3xl text-base md:text-xl lg:text-2xl">
                Create stunning images using our integrated AI models including Stable Diffusion XL, 
                Stable Diffusion 3.5, Flux Models, and more.
              </p>
            </div>
          </Link>
        </section>
      </div>

      {/* Logout Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button 
          onClick={handleLogout}
          className="px-8 py-3 text-white/90 rounded-lg backdrop-blur-sm bg-black/20
                    hover:bg-white/10 active:bg-white/20 transition-all duration-300
                    w-[200px] text-sm hover:text-white"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard; 