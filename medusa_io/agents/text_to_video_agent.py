from typing import Dict, List
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging
import asyncio
import aiohttp

load_dotenv()

logger = logging.getLogger(__name__)

class TextToVideoAgent:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.prompt_history = []

    def generate_video_prompt(self, original_prompt: str, reference_images: List[str]) -> str:
        """
        Generate an enhanced video prompt using OpenAI's API
        """
        try:
            system_message = """You are a prompt engineering expert for video generation.
            Your task is to enhance the given prompt with detailed visual and temporal descriptions
            while keeping it under 512 characters. Focus on specific details like movement,
            transitions, pacing, colors, textures, lighting, and composition."""
            
            user_message = f"""Original prompt: {original_prompt}
            
            Reference images have been analyzed. Please generate a detailed prompt that:
            1. Describes the sequence of events and motion
            2. Specifies visual style and atmosphere
            3. Details camera movements and transitions
            4. Describes lighting changes and color evolution
            5. Maintains narrative consistency
            
            Keep the final prompt under 512 characters."""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ]
            )
            
            enhanced_prompt = response.choices[0].message.content
            
            # Store in history
            self.prompt_history.append({
                "original_prompt": original_prompt,
                "enhanced_prompt": enhanced_prompt
            })
            
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error generating video prompt: {str(e)}")
            return original_prompt

    def clear_history(self):
        """Clear the prompt history"""
        self.prompt_history = []

    def get_history(self) -> List[Dict]:
        """Get the prompt generation history"""
        return self.prompt_history

    async def generate(self, prompt: str, image_input: str = None) -> str:
        """
        Generate a video using the provided prompt and optional image input
        """
        logger.info(f"Starting video generation for prompt: {prompt}")
        try:
            video_result = None
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'http://localhost:3000/api/lumaai',
                    json={
                        'prompt': prompt,
                        'promptImage': image_input,
                        'model': 'luma',
                        'duration': 10,
                        'ratio': '16:9'
                    }
                ) as response:
                    if response.status != 200:
                        raise Exception(f"API request failed with status {response.status}")
                    
                    data = await response.json()
                    generation_id = data.get('id')
                    
                    if not generation_id:
                        raise Exception("No generation ID in response")

                    # Poll for completion
                    while True:
                        async with session.get(
                            f'http://localhost:3000/api/lumaai/status/{generation_id}'
                        ) as status_response:
                            status_data = await status_response.json()
                            
                            if status_data.get('state') == 'completed':
                                video_result = status_data.get('videoUrl')
                                break
                            elif status_data.get('state') == 'failed':
                                raise Exception("Video generation failed")
                                
                            await asyncio.sleep(5)

            logger.info("Video generation completed successfully")
            return video_result

        except Exception as e:
            logger.error(f"Video generation failed: {str(e)}", exc_info=True)
            raise
