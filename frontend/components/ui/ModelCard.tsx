import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ModelCardProps {
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

export function ModelCard({
  title,
  description,
  isActive,
  onClick
}: ModelCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isActive
          ? 'bg-black/20 backdrop-blur-sm border-white/10'
          : 'bg-black/10 backdrop-blur-sm border-white/5 opacity-50'
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/60">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            <span className="text-sm text-white/60">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 