const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  const envExample = path.join(process.cwd(), '.env.example');
  const envLocal = path.join(process.cwd(), '.env.local');

  // Check if .env.local exists
  if (!fs.existsSync(envLocal)) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: .env.local file not found!');
    console.log('\x1b[33m%s\x1b[0m', 'Creating .env.local from .env.example...');

    try {
      fs.copyFileSync(envExample, envLocal);
      console.log('\x1b[32m%s\x1b[0m', '.env.local created successfully!');
      console.log('\x1b[33m%s\x1b[0m', 'Please update .env.local with your API keys.');
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', 'Failed to create .env.local:', error);
      process.exit(1);
    }
  }

  // Read and validate environment variables
  try {
    const envContent = fs.readFileSync(envLocal, 'utf8');
    const requiredVars = ['OPENAI_API_KEY', 'LUMAAI_API_KEY', 'REPLICATE_API_TOKEN'];

    const missingVars = requiredVars.filter(
      (varName) =>
        !envContent.includes(`${varName}=`) ||
        envContent.includes(`${varName}=your_`) ||
        envContent.includes(`${varName}=`)
    );

    if (missingVars.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', 'Warning: Missing or invalid environment variables:');
      missingVars.forEach((varName) => {
        console.log(`- ${varName}`);
      });
      console.log('\x1b[33m%s\x1b[0m', 'Please update these in your .env.local file.');
    } else {
      console.log('\x1b[32m%s\x1b[0m', 'Environment setup validated successfully!');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error reading .env.local:', error);
    process.exit(1);
  }
}

checkEnvironment();
