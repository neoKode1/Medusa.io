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
        log_level="info"
    )
