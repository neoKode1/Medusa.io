import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LumaAI } from 'lumaai';

export default function ImageToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState('gen3a_turbo');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const client = new LumaAI({ authToken: process.env.NEXT_PUBLIC_LUMAAI_API_KEY });

      let generation = await client.generations.create({
        prompt: prompt,
        image: uploadedImage,
        model: model,
        duration: 10,
        ratio: "16:9"
      });

      let completed = false;

      while (!completed) {
        generation = await client.generations.get(generation.id);

        if (generation.state === "completed") {
          completed = true;
          setGeneratedVideo(generation.assets.video);
          setProgress(100);
        } else if (generation.state === "failed") {
          throw new Error(`Generation failed: ${generation.failure_reason}`);
        } else {
          setProgress(generation.progress * 100);
          await new Promise(r => setTimeout(r, 3000)); // Wait for 3 seconds
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while generating the video.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 relative"
      style={{
        backgroundImage: "url('/Medusa.svg.svg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "2000px",
      }}
    >
      <div className="bg-black opacity-50 absolute inset-0" aria-hidden="true" />

      <Card className="w-full max-w-2xl relative z-10 backdrop-blur-sm bg-opacity-80">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Image to Video Generator
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-white">
          <div>
            <Label htmlFor="model" className="text-white">Choose Model:</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model" className="text-black">
                <SelectValue
                  placeholder="Select model"
                  className="font-bold text-indigo-600"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gen3a_turbo">Gen-3 Alpha Turbo (Faster)</SelectItem>
                <SelectItem value="gen3a_alpha">Gen-3 Alpha (Higher Fidelity)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt" className="text-white">Enter your prompt:</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              rows={4}
              className="text-black"
            />
          </div>

          <div>
            <Label htmlFor="image-upload" className="text-white">Upload reference image (optional):</Label>
            <div className="flex items-center space-x-4">
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                className="hidden" 
                aria-label="Upload reference image"
              />
              <Button asChild>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
                  <span>Choose File</span>
                </label>
              </Button>
            </div>
            {uploadedImage && <p className="text-green-600 mt-2">Image uploaded</p>}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isProcessing || !prompt}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isProcessing ? "Generating..." : "Generate Video"}
          </Button>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-center mt-2" aria-live="polite">{progress.toFixed(0)}% Complete</p>
            </div>
          )}

          {error && <p className="text-red-500" role="alert">{error}</p>}

          {generatedVideo && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Generated Video</h2>
              <video controls className="w-full h-64 object-cover rounded-lg">
                <source src={generatedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}