// pages/textToImage.js

import Head from 'next/head';
import Link from 'next/link';

export default function TextToImage() {
  return (
    <>
      <Head>
        <title>Text to Image - medusa.io</title>
      </Head>
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-4">Text to Image</h1>
        <p className="mb-4">Generate images from text inputs here!</p>
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Back to Home
        </Link>
      </main>
    </>
  );
}
