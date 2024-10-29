# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from medusa_io.api.prompt_generation import router as prompt_router
import logging
from pathlib import Path
from dotenv import load_dotenv
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('medusa.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path('.env.local')
if env_path.exists():
    load_dotenv(env_path)
    logger.info(f"Loaded environment variables from {env_path}")

# Validate environment variables
def validate_environment():
    required_vars = {
        "OPENAI_API_KEY": "OpenAI API key for text generation",
        "GOOGLE_CLIENT_ID": "Google OAuth client ID",
        "GOOGLE_CLIENT_SECRET": "Google OAuth client secret",
        "NEXTAUTH_SECRET": "NextAuth secret for session encryption"
    }
    
    optional_vars = {
        "LUMAAI_API_KEY": "Luma AI API key for image generation",
        "REPLICATE_API_TOKEN": "Replicate API token for model inference",
        "SEARCH_API_KEY": "Google Custom Search API key",
        "SEARCH_ENGINE_ID": "Google Custom Search Engine ID"
    }
    
    missing_required = [var for var in required_vars if not os.getenv(var)]
    missing_optional = [var for var in optional_vars if not os.getenv(var)]
    
    if missing_required:
        error_msg = "Missing required environment variables:\n"
        for var in missing_required:
            error_msg += f"- {var}: {required_vars[var]}\n"
        raise EnvironmentError(error_msg)
    
    if missing_optional:
        logger.warning("Missing optional environment variables:")
        for var in missing_optional:
            logger.warning(f"- {var}: {optional_vars[var]}")

validate_environment()

# Create FastAPI app
app = FastAPI(
    title="Medusa.io API",
    description="AI-powered prompt generation and enhancement API",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",    # Next.js development server
    "http://localhost:8000",    # FastAPI server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefix
app.include_router(
    prompt_router,
    prefix="/api",
    tags=["prompt"]
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(os.getenv("OPENAI_API_KEY")),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "medusa_io.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        reload_dirs=[str(Path(__file__).parent)],  # Only watch the medusa_io directory
        reload_excludes=["./node_modules/*"]  # Exclude node_modules from watching
    )
