import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface PromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptGenerated: (prompt: string) => void;
}

export function PromptGeneratorModal({
  isOpen,
  onClose,
  onPromptGenerated
}: PromptGeneratorModalProps) {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [mood, setMood] = useState('');
  const [movieRef, setMovieRef] = useState('');
  const [bookRef, setBookRef] = useState('');
  const [genreRef, setGenreRef] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject) {
      toast({
        title: "Error",
        description: "Please enter a subject",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/utils/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          style: style || undefined,
          mood: mood || undefined,
          movieRef: movieRef || undefined,
          bookRef: bookRef || undefined,
          genreRef: genreRef || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate prompt');
      }

      const data = await response.json();
      onPromptGenerated(data.prompt);
      onClose();
      
      toast({
        title: "Success",
        description: "Prompt generated successfully",
      });
    } catch (error) {
      console.error('Prompt generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate prompt',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prometheus Prompt Generator</DialogTitle>
          <DialogDescription>
            Let Prometheus enhance your prompts by combining your ideas with advanced AI understanding of visual styles, themes, and storytelling.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject (required)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you want to create?"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Describe what you want to create. Prometheus will enhance it with details and artistic elements.
            </p>
          </div>

          <div>
            <Label htmlFor="style">Style (optional)</Label>
            <Input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g., watercolor, oil painting, digital art"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Prometheus will incorporate artistic techniques and visual elements from your chosen style.
            </p>
          </div>

          <div>
            <Label htmlFor="mood">Mood (optional)</Label>
            <Input
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., peaceful, energetic, mysterious"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Add emotional depth to your creation. Prometheus will suggest lighting, color, and composition to match.
            </p>
          </div>

          <div>
            <Label htmlFor="movieRef">Movie Reference (optional)</Label>
            <Input
              id="movieRef"
              value={movieRef}
              onChange={(e) => setMovieRef(e.target.value)}
              placeholder="e.g., Blade Runner, The Matrix, Spirited Away"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Prometheus will analyze the visual style and cinematography of referenced movies.
            </p>
          </div>

          <div>
            <Label htmlFor="bookRef">Book Reference (optional)</Label>
            <Input
              id="bookRef"
              value={bookRef}
              onChange={(e) => setBookRef(e.target.value)}
              placeholder="e.g., Dune, Neuromancer, The Lord of the Rings"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Draw inspiration from literary descriptions and world-building elements.
            </p>
          </div>

          <div>
            <Label htmlFor="genreRef">Genre (optional)</Label>
            <Input
              id="genreRef"
              value={genreRef}
              onChange={(e) => setGenreRef(e.target.value)}
              placeholder="e.g., cyberpunk, fantasy, sci-fi, horror"
              className="bg-black/20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Prometheus will incorporate iconic elements and conventions from your chosen genre.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Prompt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 