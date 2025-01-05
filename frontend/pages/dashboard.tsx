import { type NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ImageIcon, VideoIcon, PersonIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Medusa</title>
        <meta name="description" content="Medusa AI Dashboard" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Welcome to Medusa</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/MedusaPage" className="block">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Generation
                </CardTitle>
                <CardDescription className="text-white/60">
                  Create stunning images with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Generate high-quality images from text descriptions using state-of-the-art AI models.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/MedusaVideoPage" className="block">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <VideoIcon className="w-5 h-5" />
                  Video Generation
                </CardTitle>
                <CardDescription className="text-white/60">
                  Transform images into videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Create dynamic videos from still images or text descriptions using advanced AI technology.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/character-training" className="block">
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PersonIcon className="w-5 h-5" />
                  Character Training
                </CardTitle>
                <CardDescription className="text-white/60">
                  Train custom character models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Create personalized AI models trained on your character images for unique generations.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 