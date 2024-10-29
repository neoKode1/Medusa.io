const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envExample = path.join(process.cwd(), '.env.example');
const envLocal = path.join(process.cwd(), '.env.local');

// Generate a secure random string for NEXTAUTH_SECRET
const generateSecret = () => crypto.randomBytes(32).toString('base64');

try {
  if (!fs.existsSync(envLocal)) {
    let envContent = fs.readFileSync(envExample, 'utf8');
    
    // Replace NEXTAUTH_SECRET with a generated value
    envContent = envContent.replace(
      'NEXTAUTH_SECRET=',
      `NEXTAUTH_SECRET=${generateSecret()}`
    );
    
    fs.writeFileSync(envLocal, envContent);
    console.log('Created .env.local file. Please update it with your API keys.');
  } else {
    console.log('.env.local already exists. Skipping creation.');
  }
} catch (err) {
  console.error('Error setting up environment:', err);
  process.exit(1);
} 