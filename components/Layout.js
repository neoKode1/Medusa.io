import Navbar from './Navbar';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="grow">{children}</main>
      <footer className="bg-gray-800 py-4 text-white">
        <div className="container mx-auto text-center">
          <Link href="/about">
            <a>About</a>
          </Link>
          © 2023 AI-Powered Web Application
        </div>
      </footer>
    </div>
  );
}
