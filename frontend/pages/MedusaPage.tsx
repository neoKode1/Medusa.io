import { type NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MODELS, ModelName } from '@/constants/models';
import { ApiResponse, ImageResponse } from '@/types/api';
import { PromptGeneratorModal } from '@/components/PromptGeneratorModal';
import { LuBrain } from 'react-icons/lu';

const MedusaPage: NextPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel] = useState<ModelName>('fluxPro');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const handleGenerateImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `TOK ${prompt}`,
          model: "dev",
          num_inference_steps: 28,
          guidance_scale: 3,
          prompt_strength: 0.8,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          go_fast: false,
          lora_scale: 1,
          megapixels: "1",
          extra_lora_scale: 1,
          disable_safety_checker: false
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.status !== 'succeeded' || !data.output || !Array.isArray(data.output) || data.output.length === 0) {
        console.error('Invalid response format:', data);
        throw new Error('No image URL received');
      }

      toast.success('Image generated successfully!');
      
      // Get the first image URL from the output array
      const imageUrl = data.output[0];
      console.log('Generated image URL:', imageUrl);

      if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        console.error('Invalid URL format:', imageUrl);
        throw new Error('Invalid image URL format received');
      }

      router.push(`/image-result?url=${encodeURIComponent(imageUrl)}`);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptGenerated = (enhancedPrompt: string) => {
    setPrompt(enhancedPrompt);
  };

  return (
    <>
      <Head>
        <title>Image Generation - Medusa</title>
        <meta name="description" content="Generate images using Deeptechai AI" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Image Generation</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">Generation Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-white">Prompt</Label>
                <div className="relative">
                  <Input
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-black/20 text-white pr-10"
                  />
                  <button
                    onClick={() => setIsPromptModalOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    title="Open Prometheus Prompt Generator"
                  >
                    <LuBrain className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-white">Model</Label>
                <div className="text-sm text-white/80">Using {MODELS[selectedModel].name} - {MODELS[selectedModel].description}</div>
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={isLoading || !prompt}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-white">Tips</h2>
            <div className="space-y-4 text-white/80">
              <p>
                Be specific and detailed in your prompts. Include information about:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Subject matter (what you want to see)</li>
                <li>Style (artistic style, medium, or technique)</li>
                <li>Mood or atmosphere</li>
                <li>Color scheme or lighting</li>
                <li>Composition or perspective</li>
              </ul>
              <p>
                Example: &quot;A serene Japanese garden at sunset, with cherry blossoms falling gently, 
                painted in watercolor style, soft pastel colors, ethereal lighting&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      <PromptGeneratorModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onPromptGenerated={handlePromptGenerated}
      />
    </>
  );
};

export default MedusaPage;