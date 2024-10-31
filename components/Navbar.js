import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 py-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">AI-Powered Web App</div>
        <div>
          <Link href="/" className="px-4">
            Home
          </Link>
          <Link href="/text-to-image" className="px-4">
            Text-to-Image
          </Link>
          <Link href="/image-to-video" className="px-4">
            Image-to-Video
          </Link>
        </div>
      </div>
    </nav>
  );
}
