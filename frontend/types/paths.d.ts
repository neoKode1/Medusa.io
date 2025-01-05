declare module '@/constants/models' {
  export * from '../constants/models';
}

declare module '@/types/api' {
  export * from './api';
}

declare module '@/lib/utils' {
  export * from '../lib/utils';
}

declare module '@/components/ui/*' {
  const component: any;
  export default component;
} 