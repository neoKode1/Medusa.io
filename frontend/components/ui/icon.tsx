import React from 'react';
import Image from 'next/image';
import * as Icons from 'lucide-react';

interface IconProps extends Omit<React.ComponentProps<'svg'>, 'ref'> {
  name?: keyof typeof Icons;
  customIcon?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, customIcon, size = 20, ...props }) => {
  if (customIcon) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Image
          src={customIcon}
          alt={name || 'icon'}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  if (name) {
    const LucideIcon = Icons[name];
    return <LucideIcon size={size} {...props} />;
  }

  return null;
};

export default Icon; 