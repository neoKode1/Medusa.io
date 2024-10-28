import { useState } from 'react';
import { Box, TextField, Select, MenuItem, Button, Typography, Paper, Container } from '@mui/material';

const GENRES = {
  horror: ['The Shining', 'Get Out', 'A Nightmare on Elm Street', 'The Exorcist', 'Hereditary'],
  comedy: ['Groundhog Day', 'Superbad', 'Bridesmaids', 'The Big Lebowski', 'Shaun of the Dead'],
  drama: ['The Godfather', 'The Shawshank Redemption', "Schindler's List", 'Forrest Gump', '12 Years a Slave'],
  suspense: ['Gone Girl', 'Inception', 'No Country for Old Men', 'Memento', 'Rear Window'],
  mystery: ['Seven', 'Knives Out', 'Chinatown', 'Mystic River', 'L.A. Confidential']
};

const BOOKS = [
  'To Kill a Mockingbird', '1984', 'The Great Gatsby',
  'Harry Potter and the Philosopher\'s Stone', 'The Catcher in the Rye',
  'Pride and Prejudice', 'The Lord of the Rings', 'The Alchemist',
  'The Da Vinci Code', 'The Hunger Games'
];

const STYLES = [
  'Cinematic', 'Photorealistic', 'Artistic', 'Abstract',
  'Film Noir', 'Vintage', 'Modern', 'Fantasy', 'Sci-fi'
];

const MODES = [
  { value: 'image', label: 'Text to Image' },
  { value: 'video', label: 'Text to Video' }
];

export default function GeneratePrompt() {
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [reference, setReference] = useState('');
  const [style, setStyle] = useState('');
  const [mode, setMode] = useState('image'); // Default to image mode
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get references based on selected genre
  const getReferences = () => {
    if (genre && GENRES[genre.toLowerCase()]) {
      return [...GENRES[genre.toLowerCase()], ...BOOKS];
    }
    return BOOKS;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          genre,
          reference,
          style,
          mode,
        }),
      });

      const data = await response.json();

      // Handle quota exceeded error
      if (data.error === 'QUOTA_EXCEEDED') {
        setError('OpenAI API quota exceeded. Please try again later or contact support.');
        setGeneratedPrompt(description); // Use original prompt as fallback
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate prompt');
      }

      setGeneratedPrompt(data.enhanced_prompt || description);
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to generate prompt. Please try again.');
      setGeneratedPrompt(description); // Use original prompt as fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Prompt Generator
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Mode Selection Dropdown */}
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            displayEmpty
            fullWidth
            label="Generation Mode"
          >
            {MODES.map((mode) => (
              <MenuItem key={mode.value} value={mode.value}>
                {mode.label}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label={`Describe your ${mode === 'video' ? 'video' : 'image'}`}
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  animation: 'randomGlow 5s infinite',
                },
                '&.Mui-focused fieldset': {
                  animation: 'randomGlow 5s infinite',
                }
              }
            }}
          />

          <Select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            displayEmpty
            fullWidth
            label="Genre"
          >
            <MenuItem value="">Select Genre</MenuItem>
            {Object.keys(GENRES).map((genre) => (
              <MenuItem key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            displayEmpty
            fullWidth
            label="Reference"
          >
            <MenuItem value="">Select Reference</MenuItem>
            {getReferences().map((ref) => (
              <MenuItem key={ref} value={ref}>
                {ref}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            displayEmpty
            fullWidth
            label="Style"
          >
            <MenuItem value="">Select Style</MenuItem>
            {STYLES.map((style) => (
              <MenuItem key={style} value={style}>
                {style}
              </MenuItem>
            ))}
          </Select>

          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading || !description}
            sx={{ 
              mt: 2,
              '&:hover': {
                animation: 'randomGlow 5s infinite',
              }
            }}
          >
            {isLoading ? 'Generating...' : `Generate ${mode === 'video' ? 'Video' : 'Image'} Prompt`}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {generatedPrompt && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Generated Prompt:
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography>{generatedPrompt}</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
