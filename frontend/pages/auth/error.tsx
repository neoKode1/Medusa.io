import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const getErrorMessage = (error: string | string[] | undefined) => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration.';
    case 'AccessDenied':
      return 'Access denied. You do not have permission to sign in.';
    case 'Verification':
      return 'The verification link may have expired or has already been used.';
    default:
      return 'An unexpected authentication error occurred.';
  }
};

export default function ErrorPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const { error } = router.query;
    setErrorMessage(getErrorMessage(error));
  }, [router.query]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <Head>
        <title>Authentication Error - MEDUSA.io</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
        <p className="text-lg mb-8">{errorMessage}</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 