const { spawn } = require('child_process');
const path = require('path');

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

// Start the FastAPI server
startFastAPIServer();
