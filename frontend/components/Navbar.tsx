import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from "next-auth/react";
import { HomeIcon as Home } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <>
      {/* Navigation Bar - Mobile Friendly */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between px-4 md:px-6">
          {/* Home Button */}
          <Link 
            href="/dashboard"
            className="p-4 text-white hover:text-white/80 transition-colors"
            aria-label="Go to Dashboard"
          >
            <Home size={24} />
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2 p-4 md:gap-4 md:p-6">
            <Link 
              href="/MedusaPage" 
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                       rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Text to Image
            </Link>
            
            <Link 
              href="/MedusaVideoPage" 
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                       rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Video Generation
            </Link>
            
            <Link 
              href="/character-training" 
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                       rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Character Training
            </Link>
            
            <Link 
              href="/gallery" 
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-white border border-white/50 
                       rounded-lg hover:bg-white/10 transition-all whitespace-nowrap"
            >
              Gallery
            </Link>
          </div>

          {/* Spacer to maintain centering */}
          <div className="w-[24px] p-4"></div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button 
          onClick={handleLogout}
          className="px-8 py-4 md:py-3 text-white border-2 md:border border-white rounded-lg 
                    transition-all duration-300 hover:bg-white/10 active:bg-white/20 
                    w-[200px] text-lg md:text-base"
        >
          Log Out
        </button>
      </div>
    </>
  );
};

export default Navbar; 