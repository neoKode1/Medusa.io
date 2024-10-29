import { useSession, signIn, signOut } from "next-auth/react"
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>MEDSUSA.io - AI Image & Video Generation</title>
        <meta name="description" content="AI-powered image and video generation platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-6xl font-bold text-center text-white mb-8">
          MEDSUSA.io
        </h1>
        <p className="text-xl text-center text-gray-300 mb-12">
          Powered with Luma Dream Machine along with Flux Black Forest
        </p>

        {!session ? (
          <div className="max-w-md mx-auto bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
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
        ) : (
          <div className="max-w-md mx-auto text-center text-white">
            <p className="mb-4">Welcome, {session.user.name}!</p>
            <button
              onClick={() => signOut()}
              className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Your existing content */}
      </main>
    </div>
  )
}
