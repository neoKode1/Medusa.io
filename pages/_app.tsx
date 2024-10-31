import { SessionProvider } from "next-auth/react";
import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import '../styles/globals.css';

// Define the layout page type with proper generics
type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// Define the app props type with correct session handling
type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};

// App component with explicit types
export default function MyApp({
  Component,
  pageProps: { session, ...otherPageProps }
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...otherPageProps} />)}
    </SessionProvider>
  );
}