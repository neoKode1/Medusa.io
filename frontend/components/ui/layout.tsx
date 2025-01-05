"use client"

import React from 'react';
import { NavigationBar } from './navigation-bar';
import { Toaster } from './toaster';

const navigationItems = [
  { href: '/MedusaPage', label: 'Image Generation' },
  { href: '/MedusaVideoPage', label: 'Video Generation' },
  { href: '/character-training', label: 'Character Training' }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <NavigationBar items={navigationItems} />
      <main>{children}</main>
      <Toaster />
    </div>
  );
}

export default Layout; 