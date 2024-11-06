import type { AppProps } from "next/app"
import { useRouter } from 'next/router'
import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  const router = useRouter()

  // Redirect /ImageToVideoPage to /image-to-video
  if (typeof window !== 'undefined' && router.pathname === '/ImageToVideoPage') {
    router.replace('/image-to-video')
    return null
  }

  return (
    <SessionProvider session={session}>
      <main>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  )
} 