# api/prompt_generation.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict
from pydantic import BaseModel
from ..agents.agent_team import AgentTeam
import logging
from functools import lru_cache
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str
    mode: str = "image"  # Default to image mode

    class Config:
        schema_extra = {
            "example": {
                "prompt": "A serene lake at sunset",
                "mode": "image"
            }
        }

@lru_cache()
def get_agent_team():
    """
    Dependency to create and cache AgentTeam instance
    """
    try:
        config = {
            "openai_api_key": os.getenv("OPENAI_API_KEY"),
        }
        return AgentTeam(config)
    except Exception as e:
        logger.error(f"Failed to initialize AgentTeam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize AI services"
        )

@router.post("/generate-prompt", response_model=Dict)
async def generate_prompt(
    request: PromptRequest,
    agent_team: AgentTeam = Depends(get_agent_team)
) -> Dict:
    """
    Generate an enhanced prompt based on web search results
    """
    try:
        logger.info(f"Processing prompt request: {request.prompt[:50]}...")
        
        if not request.prompt.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt cannot be empty"
            )
            
        if request.mode not in ["image", "video"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mode must be either 'image' or 'video'"
            )
            
        result = agent_team.process_prompt(
            prompt=request.prompt,
            mode=request.mode
        )
        
        logger.info("Successfully generated enhanced prompt")
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error generating prompt: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating prompt: {str(e)}"
        )
