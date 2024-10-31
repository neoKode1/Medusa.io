# api/prompt_generation.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, List
from medusa_io.agents.agent_team import AgentTeam  # Update this import
import logging
import os
from functools import lru_cache
import traceback
from dotenv import load_dotenv
import uuid
import time
from pathlib import Path
from pydantic import BaseModel

# Set up logging first, before any other operations
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Load environment variables from all possible locations
env_paths = [
    '.env',
    '.env.local',
    '.env.development',
    Path(__file__).parent.parent.parent / '.env.local'  # Look for .env.local in project root
]

# Load environment variables
for env_path in env_paths:
    if Path(env_path).exists():
        load_dotenv(env_path)
        logger.info(f"Loaded environment variables from {env_path}")

def get_agent_team():
    """
    Create AgentTeam instance with proper error handling
    """
    try:
        # Try to get API key from environment with detailed logging
        openai_api_key = os.getenv("OPENAI_API_KEY")
        logger.info("Checking OpenAI API key...")
        
        if not openai_api_key:
            # Try loading directly from .env.local in the project root
            env_path = Path(__file__).parent.parent.parent / '.env.local'
            if env_path.exists():
                with open(env_path) as f:
                    for line in f:
                        if line.startswith('OPENAI_API_KEY='):
                            openai_api_key = line.split('=')[1].strip()
                            logger.info("Found API key in .env.local")
                            break
        
        if not openai_api_key:
            logger.error("OpenAI API key not found in any environment file")
            raise ValueError(
                "OpenAI API key not found. Please ensure OPENAI_API_KEY is set in .env.local"
                "\nCheck the following locations for .env files:"
                f"\n{[str(p) for p in env_paths]}"
            )
            
        # Validate API key format
        if not openai_api_key.startswith('sk-'):
            logger.error("Invalid OpenAI API key format")
            raise ValueError("Invalid OpenAI API key format. Key should start with 'sk-'")
            
        config = {
            "openai_api_key": openai_api_key,
        }
        
        logger.info("API key validated, initializing AgentTeam...")
        return AgentTeam(config)
    except Exception as e:
        logger.error(f"Failed to initialize AgentTeam: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize AI services: {str(e)}"
        )

class PromptRequest(BaseModel):
    description: str
    genre: str | None = None
    reference: str | None = None
    style: str | None = None

@router.post("/generate-prompt")
async def generate_prompt(request: PromptRequest, agent_team: AgentTeam = Depends(get_agent_team)) -> Dict:
    """
    Generate an enhanced prompt based on web search results and influences
    """
    try:
        logger.info("=== Request Details ===")
        logger.info(f"Request data: {request}")
        
        # Extract all fields
        prompt = request.description or request.genre or request.reference or request.style
        genre = request.genre or request.reference or request.style
        reference = request.reference or request.style
        style = request.style
        
        if not prompt:
            logger.error("No prompt or description found in request")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request must include either 'prompt' or 'description' field"
            )
        
        # Ensure prompt has prefix
        if not prompt.startswith('@prompt_dir.txt'):
            prompt = f'@prompt_dir.txt {prompt}'
        
        logger.info(f"Using prompt: {prompt}")
        logger.info(f"Genre: {genre}")
        logger.info(f"Reference: {reference}")
        logger.info(f"Style: {style}")
        
        # Process the request with influences
        logger.info("=== Processing Request ===")
        result = agent_team.process_prompt(
            prompt=prompt,
            mode='image',
            influences={
                'genre': genre,
                'reference': reference,
                'style': style
            }
        )
        
        # Ensure the enhanced prompt has the prefix
        if result.get('enhanced_prompt') and not result['enhanced_prompt'].startswith('@prompt_dir.txt'):
            result['enhanced_prompt'] = f'@prompt_dir.txt {result["enhanced_prompt"]}'
        
        logger.info("=== Result Details ===")
        logger.info(f"Result: {result}")
        
        return result
            
    except HTTPException as he:
        logger.error(f"HTTP Exception: {str(he)}")
        raise he
    except Exception as e:
        logger.error("=== Unexpected Error ===")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error message: {str(e)}")
        logger.error(traceback.format_exc())
        
        return {
            "original_prompt": prompt if 'prompt' in locals() else request.description,
            "enhanced_prompt": f"@prompt_dir.txt {prompt if 'prompt' in locals() else request.description}",
            "reference_images": [],
            "mode": 'image',
            "agent_used": "",
            "influences": {
                'genre': genre,
                'reference': reference,
                'style': style
            },
            "error": str(e)
        }

@router.post("/generate")
async def generate(request: Dict):
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}] Received generation request: {request.get('prompt', '')[:50]}...")
    
    try:
        if not request.get('prompt'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt is required"
            )
            
        logger.info(f"[{request_id}] Initializing agent team")
        agent_team = get_agent_team()
        
        logger.info(f"[{request_id}] Starting generation process")
        generation_start = time.time()
        
        result = await agent_team.process_request(request['prompt'])
        
        generation_time = time.time() - generation_start
        logger.info(f"[{request_id}] Generation completed successfully in {generation_time:.2f}s")
        
        return {
            "status": "success",
            "result": result,
            "request_id": request_id,
            "processing_time": generation_time
        }
        
    except Exception as e:
        logger.error(f"[{request_id}] Generation failed: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "message": str(e),
            "request_id": request_id
        }

@router.get("/status/{request_id}")
async def get_status(request_id: str):
    try:
        logger.info(f"Status check for request {request_id}")
        return {
            "request_id": request_id,
            "status": "processing",
            "progress": 50
        }
    except Exception as e:
        logger.error(f"Error checking status for {request_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
