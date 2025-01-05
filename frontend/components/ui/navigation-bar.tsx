import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { Button } from './button';

interface NavigationItem {
  href: string;
  label: string;
}

interface NavigationBarProps {
  items: NavigationItem[];
}

export function NavigationBar({ items }: NavigationBarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: '/' });
    router.push(data.url);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-white">
          Medusa
        </Link>
        <div className="flex items-center gap-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${
                router.pathname === item.href
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      {session && (
        <Button
          onClick={handleSignOut}
          variant="secondary"
          className="text-white/60 hover:text-white"
        >
          Sign Out
        </Button>
      )}
    </nav>
  );
} 