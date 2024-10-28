const express = require('express');
const next = require('next');
const { spawn } = require('child_process');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});

// Function to start the FastAPI server
function startFastAPIServer() {
  const pythonPath = path.join(process.cwd(), 'venv', 'Scripts', 'python');
  const serverProcess = spawn(pythonPath, ['-m', 'uvicorn', 'medusa_io.main:app', '--reload', '--port', '8000']);

  serverProcess.stdout.on('data', (data) => {
    console.log(`FastAPI: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`FastAPI Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`FastAPI server exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    serverProcess.kill();
    process.exit();
  });
}

// Start the server
startFastAPIServer();
