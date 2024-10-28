import { useState } from 'react';
import { Box, TextField, Select, MenuItem, Button, Typography, Paper, Container } from '@mui/material';
import Link from 'next/link';

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
  const [showDropdown, setShowDropdown] = useState(false);

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
      // Add prefix to description
      const prefixedDescription = `@prompt_dir.txt ${description}`;

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: prefixedDescription, // Send prefixed description
          genre,
          reference,
          style,
          mode,
        }),
      });

      const data = await response.json();

      if (data.error === 'QUOTA_EXCEEDED') {
        setError('OpenAI API quota exceeded. Please try again later or contact support.');
        setGeneratedPrompt(description);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate prompt');
      }

      setGeneratedPrompt(data.enhanced_prompt || description);
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to generate prompt. Please try again.');
      setGeneratedPrompt(description);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/ninja.mp4" type="video/mp4" />
      </video>

      {/* Add overlay for better readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />

      {/* Content Container */}
      <Container maxWidth="md" sx={{ 
        py: 4,
        position: 'relative',
        zIndex: 2
      }}>
        {/* Menu Button */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          <Button
            onClick={toggleDropdown}
            sx={{
              px: 4,
              py: 2,
              color: 'white',
              borderRadius: '8px',
              border: '1px solid white',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Menu
            <Box component="span" sx={{ ml: 1 }}>▼</Box>
          </Button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <Paper sx={{
              position: 'absolute',
              left: 0,
              mt: 1,
              width: '200px',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 30
            }}>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                <Box component="li">
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 4, py: 2, color: 'black', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}>
                      Home
                    </Box>
                  </Link>
                </Box>
                <Box component="li">
                  <Link href="/ImageToVideoPage" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 4, py: 2, color: 'black', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}>
                      Image to Video
                    </Box>
                  </Link>
                </Box>
                <Box component="li">
                  <Link href="/TextToImagePage" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 4, py: 2, color: 'black', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}>
                      Text to Image
                    </Box>
                  </Link>
                </Box>
                <Box component="li">
                  <Link href="/generate-prompt" style={{ textDecoration: 'none' }}>
                    <Box sx={{ px: 4, py: 2, color: 'black', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }}>
                      Generate Prompt
                    </Box>
                  </Link>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        <Paper elevation={3} sx={{ 
          p: 4,
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: 'white',
            textAlign: 'center',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 'bold',
            mb: 4
          }}>
            MEDSUSA.io
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
            Prompt Generator
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Mode Selection Dropdown */}
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              displayEmpty
              fullWidth
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiSelect-icon': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                },
              }}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'white',
                },
              }}
              InputLabelProps={{
                style: { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

            {/* Style the Select components similarly */}
            {['genre', 'reference', 'style'].map((selectField) => (
              <Select
                key={selectField}
                value={eval(selectField)}
                onChange={(e) => eval(`set${selectField.charAt(0).toUpperCase() + selectField.slice(1)}`)(e.target.value)}
                displayEmpty
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                <MenuItem value="">Select {selectField.charAt(0).toUpperCase() + selectField.slice(1)}</MenuItem>
                {selectField === 'genre' && Object.keys(GENRES).map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </MenuItem>
                ))}
                {selectField === 'reference' && getReferences().map((ref) => (
                  <MenuItem key={ref} value={ref}>{ref}</MenuItem>
                ))}
                {selectField === 'style' && STYLES.map((style) => (
                  <MenuItem key={style} value={style}>{style}</MenuItem>
                ))}
              </Select>
            ))}

            <Button 
              type="submit" 
              variant="contained"
              disabled={isLoading || !description}
              sx={{ 
                mt: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              {isLoading ? 'Generating...' : `Generate ${mode === 'video' ? 'Video' : 'Image'} Prompt`}
            </Button>

            {error && (
              <Typography color="error" sx={{ mt: 2, color: '#ff6b6b' }}>
                {error}
              </Typography>
            )}

            {generatedPrompt && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Generated Prompt:
                </Typography>
                <Paper elevation={1} sx={{ 
                  p: 2, 
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }}>
                  <Typography>{generatedPrompt}</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
