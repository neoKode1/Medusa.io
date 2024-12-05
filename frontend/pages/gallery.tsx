import React from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { HomeIcon, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import Link from 'next/link';

const GalleryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Bar */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <HomeIcon size={24} className="text-white/80" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/MedusaPage" className="flex items-center space-x-2 text-white/80 hover:text-white">
                <ImageIcon size={20} />
                <span>Images</span>
              </Link>
              <Link href="/MedusaVideoPage" className="flex items-center space-x-2 text-white/80 hover:text-white">
                <VideoIcon size={20} />
                <span>Videos</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Gallery</h1>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
              Images
            </button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
              Videos
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder for gallery items */}
          <div className="aspect-square bg-white/5 rounded-lg animate-pulse"></div>
          <div className="aspect-square bg-white/5 rounded-lg animate-pulse"></div>
          <div className="aspect-square bg-white/5 rounded-lg animate-pulse"></div>
          <div className="aspect-square bg-white/5 rounded-lg animate-pulse"></div>
        </div>

        {/* Empty State */}
        <div className="text-center py-20">
          <p className="text-white/60">No items in your gallery yet.</p>
          <div className="mt-4 space-x-4">
            <Link href="/MedusaPage" className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <ImageIcon size={20} className="mr-2" />
              Create Image
            </Link>
            <Link href="/MedusaVideoPage" className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <VideoIcon size={20} className="mr-2" />
              Create Video
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage; 