import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Add API call for chat response here
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Chat Assistant
      </Typography>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              p: 1,
              mb: 1,
              backgroundColor: msg.sender === 'user' ? 'primary.light' : 'grey.100',
              borderRadius: 1,
              maxWidth: '80%',
              ml: msg.sender === 'user' ? 'auto' : 0,
            }}
          >
            <Typography>{msg.content}</Typography>
          </Box>
        ))}
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          size="small"
        />
        <Button type="submit" variant="contained">
          Send
        </Button>
      </Box>
    </Paper>
  );
}
