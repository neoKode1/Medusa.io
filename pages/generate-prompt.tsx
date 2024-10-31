import { useState, FormEvent } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Container,
} from '@mui/material';

// Define constants at the top level
const STYLES = [
  'Cinematic',
  'Photorealistic',
  'Artistic',
  'Abstract',
  'Film Noir',
  'Vintage',
  'Modern',
  'Fantasy',
  'Sci-fi',
  // ... rest of your styles
] as const;

type Style = typeof STYLES[number];

interface FormData {
  description: string;
  genre: string;
  movieReference: string;
  bookReference: string;
  style: Style;
  mode: 'image' | 'video';
}

const GeneratePrompt = () => {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    genre: '',
    movieReference: '',
    bookReference: '',
    style: STYLES[0],
    mode: 'image',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedPrompt(data.enhanced_prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Generate AI Prompt
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'white' }
              }}
            />

            <Select
              fullWidth
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value as Style })}
              sx={{ mt: 2, color: 'white' }}
            >
              {STYLES.map((style) => (
                <MenuItem key={style} value={style}>
                  {style}
                </MenuItem>
              ))}
            </Select>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Generating...' : 'Generate Prompt'}
            </Button>

            {generatedPrompt && (
              <Box mt={4}>
                <Typography variant="h6" sx={{ color: 'white' }}>Generated Prompt:</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ color: 'white' }}>{generatedPrompt}</Typography>
                </Paper>
              </Box>
            )}
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default GeneratePrompt;
