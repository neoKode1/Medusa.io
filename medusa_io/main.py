# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from medusa_io.api.prompt_generation import router as prompt_router
import logging
from dotenv import load_dotenv
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env.local')

def validate_environment():
    required_vars = {
        'OPENAI_API_KEY': 'OpenAI API key for text generation',
        'GOOGLE_CLIENT_ID': 'Google OAuth client ID',
        'GOOGLE_CLIENT_SECRET': 'Google OAuth client secret'
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        if not os.getenv(var):
            missing_vars.append(f"- {var}: {description}")
    
    if missing_vars:
        error_msg = "Missing required environment variables:\n" + "\n".join(missing_vars)
        raise EnvironmentError(error_msg)

# Create FastAPI app
app = FastAPI(
    title="Medusa.io API",
    description="Backend API for Medusa.io",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prompt_router, prefix="/api", tags=["prompt"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Validate environment on startup
validate_environment()
