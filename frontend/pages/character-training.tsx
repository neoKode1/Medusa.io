import { useSession } from "next-auth/react"
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, UploadIcon, HomeIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { NextPage } from 'next'
import Navbar from '../components/Navbar';
import { fal } from "@fal-ai/client";
import { toast } from 'react-hot-toast';

interface ModelFile {
  url: string;
  name?: string;
}

interface TrainingResponse {
  success: boolean;
  error?: string;
  data: {
    model_id?: string;
    diffusers_lora_file?: ModelFile;
    config_file?: ModelFile;
  };
  requestId: string;
}

const CharacterTraining: NextPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [images, setImages] = useState<File[]>([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [isStyle, setIsStyle] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelFiles, setModelFiles] = useState<{
    loraFile?: ModelFile;
    configFile?: ModelFile;
  }>({});

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray].slice(0, 4));
    }
  }, []);

  const handleDragDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setImages(prev => [...prev, ...filesArray].slice(0, 4));
    }
  }, []);

  const handleTraining = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      // Convert images to base64
      const imagesData = await Promise.all(images.map(async (image) => {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(image);
        });
      }));

      console.log('Sending training request with:', {
        imageCount: imagesData.length,
        triggerWord: triggerWord || 'No trigger word',
        isStyle
      });

      const response = await fetch('/api/character-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: imagesData,
          triggerWord: triggerWord || '',
          isStyle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as TrainingResponse;
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Store model files
      setModelFiles({
        loraFile: result.data.diffusers_lora_file,
        configFile: result.data.config_file
      });

      console.log('Training complete:', result);
      toast.success('Training completed successfully!');
      
    } catch (error) {
      console.error('Training error:', error);
      toast.error(error instanceof Error ? error.message : 'Training failed');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push('/');
    }
  }, [session, status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Side Panel */}
      <div className="w-80 border-r border-white/5 h-screen sticky top-0 overflow-hidden hover:overflow-y-auto transition-all">
        <div className="p-6">
          <h2 className="text-xl font-medium text-white/80 mb-6">Training Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white/50 uppercase tracking-wider">Options</label>
              <div className="mt-2 space-y-3">
                <div className="p-4 border border-white/10 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isStyle}
                      onChange={(e) => setIsStyle(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span className="text-sm text-white/80">Style Training</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <HomeIcon size={24} className="text-white/80" />
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Train Your Character</h1>
            <p className="text-white/60">Upload images to train your custom AI model</p>
          </div>

          <div className="border border-white/10 rounded-xl p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Training Images</label>
              <div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
              >
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index}
                    className="aspect-square border border-white/10 rounded-lg flex items-center justify-center overflow-hidden hover:border-white/20 transition-colors"
                  >
                    {images[index] ? (
                      <Image
                        src={URL.createObjectURL(images[index])}
                        alt={`Training image ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-white/40 text-center p-4">
                        <UploadIcon className="mx-auto mb-2" />
                        <span className="text-sm">Drop image here</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <input
                type="text"
                value={triggerWord}
                onChange={(e) => setTriggerWord(e.target.value)}
                className="w-full bg-transparent text-white/90 rounded-lg p-4 
                         border border-white/10 focus:outline-none focus:ring-1 
                         focus:ring-blue-500/50 mb-4 placeholder-white/30"
                placeholder="Enter trigger word..."
              />

              <div className="flex justify-between items-center">
                <div className="text-sm text-white/40">
                  Training cost: $2 per run
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setImages([]);
                      setTriggerWord('');
                      setIsStyle(false);
                    }}
                    className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-white/80"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleTraining}
                    disabled={images.length === 0 || isProcessing}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 
                             ${isProcessing || images.length === 0
                               ? 'border border-white/10 text-white/50 cursor-not-allowed'
                               : 'bg-blue-500 hover:bg-blue-600'} 
                             text-white font-medium`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="animate-spin" size={18} />
                        <span>Training...</span>
                      </>
                    ) : (
                      'Start Training'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterTraining;