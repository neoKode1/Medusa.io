import type { AppProps } from "next/app"
import { useRouter } from 'next/router'
import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { Toaster } from 'react-hot-toast'

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
        <Toaster 
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{
            // Default options for all toasts
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </main>
    </SessionProvider>
  )
} 