import React from 'react';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  children: React.ReactNode;
  className?: string;
}

export function ImageUpload({ children, className }: ImageUploadProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  );
} 