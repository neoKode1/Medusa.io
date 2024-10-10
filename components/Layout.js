import Navbar from './Navbar'
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <Link href="/about">
            <a>About</a>
          </Link>
          © 2023 AI-Powered Web Application
        </div>
      </footer>
    </div>
  )
}
