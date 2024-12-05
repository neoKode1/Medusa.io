declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    absoluteStrokeWidth?: boolean
  }

  export const RefreshCw: FC<IconProps>
  export const ChevronDown: FC<IconProps>
  export const Download: FC<IconProps>
  export const UploadIcon: FC<IconProps>
  export const HomeIcon: FC<IconProps>
  export const Image: FC<IconProps>
  export const Video: FC<IconProps>
} 