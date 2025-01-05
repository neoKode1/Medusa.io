import { type NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import MultiImageUpload from '@/components/MultiImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CharacterTraining: NextPage = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characterName, setCharacterName] = useState('');

  const handleImagesSelect = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (!characterName.trim()) {
      toast.error('Please enter a character name');
      return;
    }

    if (images.length < 4) {
      toast.error('Please upload at least 4 images for better results');
      return;
    }

    if (images.length > 20) {
      toast.error('Maximum 20 images allowed');
      return;
    }

    try {
      setIsLoading(true);
      // Training logic here
      toast.success('Training started successfully');
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Failed to start training');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Character Training - Medusa</title>
        <meta name="description" content="Train custom character models" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Character Training</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Character Details</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="characterName" className="text-white">Character Name</Label>
                  <Input
                    id="characterName"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter your character's name"
                    className="bg-black/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Reference Images</Label>
                  <MultiImageUpload
                    onImagesSelect={handleImagesSelect}
                    currentImages={images}
                    onImageRemove={handleImageRemove}
                    label="Upload high-quality reference images of your character"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || images.length === 0 || !characterName.trim()}
              className="w-full"
            >
              {isLoading ? 'Starting Training...' : 'Start Training'}
            </Button>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Tips</h2>
            <div className="space-y-4 text-white/80">
              <p>For best results:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Use high-quality, well-lit images</li>
                <li>Ensure the character is clearly visible</li>
                <li>Include a variety of poses and expressions</li>
                <li>Avoid busy backgrounds</li>
                <li>Use consistent lighting across images</li>
                <li>Upload 4-20 images for optimal training</li>
                <li>Include close-ups and full-body shots</li>
                <li>Maintain consistent character appearance</li>
              </ul>
              <p className="mt-4 text-sm">
                Note: Training typically takes 1-2 hours. You'll receive a notification when it's complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharacterTraining;