import { type NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { TrainingForm } from '@/components/ui/training-form';
import { toast } from 'react-hot-toast';

const Training: NextPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [instanceName, setInstanceName] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    imageFiles.forEach(file => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (!instanceName) {
      toast.error('Please enter an instance name');
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
        <title>Training - Medusa</title>
        <meta name="description" content="Train custom models" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Training</h1>
        <div className="max-w-2xl mx-auto">
          <TrainingForm
            images={images}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            instanceName={instanceName}
            onInstanceNameChange={(e) => setInstanceName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Training; 