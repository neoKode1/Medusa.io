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
        self.system_prompt = """You are a video prompt engineering expert. 
        Your task is to enhance the given prompt with detailed descriptions suitable for video generation.
        Focus on movement, timing, transitions, camera angles, and dynamic elements.
        Keep the final prompt under 512 characters while maintaining rich detail."""

    async def generate(self, prompt, image_input):
        logger.info(f"Starting video generation for prompt: {prompt}")
        try:
            logger.info("Preparing video generation parameters")
            video_result = None
            
            # Use the original prompt directly without enhancement
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'http://localhost:3000/api/lumaai',
                    json={
                        'prompt': prompt,  # Use original prompt directly
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

    async def check_status(self):
        """This method is now handled within generate()"""
        pass

    async def fetch_video_result(self):
        """This method is now handled within generate()"""
        pass

    def generate_video_prompt(self, original_prompt: str, reference_images: List[str]) -> str:
        """
        Generate an enhanced video prompt using OpenAI's API with swarm-like coordination
        """
        try:
            # First, analyze reference images
            image_analysis = self._analyze_reference_images(reference_images)
            
            # Then, generate the enhanced prompt
            user_message = f"""Original prompt: {original_prompt}

            Reference image analysis: {image_analysis}

            Please generate a detailed video prompt that:
            1. Captures the core visual elements from the reference images
            2. Adds dynamic elements and movement
            3. Specifies camera movements and transitions
            4. Describes timing and pacing
            5. Maintains visual consistency with the reference material
            
            Keep the final prompt under 512 characters."""

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_message}
                ]
            )

            enhanced_prompt = response.choices[0].message.content
            
            # Store in history
            self.prompt_history.append({
                "original_prompt": original_prompt,
                "enhanced_prompt": enhanced_prompt,
                "reference_images": reference_images
            })
            
            return enhanced_prompt
            
        except Exception as e:
            print(f"Error generating video prompt: {str(e)}")
            return original_prompt

    def _analyze_reference_images(self, image_urls: List[str]) -> str:
        """
        Analyze reference images to extract relevant visual information
        """
        try:
            analysis_prompt = f"""Analyze these image URLs for key visual elements:
            {', '.join(image_urls)}
            
            Focus on:
            1. Color schemes
            2. Composition
            3. Lighting
            4. Movement potential
            5. Scene transitions"""

            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "user", "content": analysis_prompt}
                ]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error analyzing images: {str(e)}")
            return "Unable to analyze reference images"

    def clear_history(self):
        """Clear the prompt history"""
        self.prompt_history = []

    def get_history(self) -> List[Dict]:
        """Get the prompt generation history"""
        return self.prompt_history
