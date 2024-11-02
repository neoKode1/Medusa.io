const { spawn } = require('child_process');
const path = require('path');

function startFastAPIServer() {
  const pythonPath = path.join(process.cwd(), 'backend', 'venv', 'Scripts', 'python');
  const serverProcess = spawn(pythonPath, [
    '-m',
    'uvicorn',
    'app.main:app',
    '--reload',
    '--port',
    '8000',
    '--host',
    '0.0.0.0'
  ], {
    cwd: path.join(process.cwd(), 'backend')
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`FastAPI: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`FastAPI Error: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`FastAPI server exited with code ${code}`);
  });

  process.on('SIGINT', () => {
    serverProcess.kill();
    process.exit();
  });
}

startFastAPIServer();
