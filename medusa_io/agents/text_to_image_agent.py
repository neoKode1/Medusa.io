from typing import Dict, List
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging
import aiohttp

load_dotenv()

logger = logging.getLogger(__name__)

class TextToImageAgent:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.prompt_history = []

    def generate_image_prompt(self, original_prompt: str, reference_images: List[str]) -> str:
        """
        Generate an enhanced image prompt using OpenAI's API
        """
        try:
            system_message = """You are a prompt engineering expert for image generation.
            Your task is to enhance the given prompt with detailed visual descriptions
            while keeping it under 512 characters. Focus on specific details like colors,
            textures, lighting, composition, and artistic style."""
            
            user_message = f"""Original prompt: {original_prompt}
            
            Reference images have been analyzed. Please generate a detailed prompt that:
            1. Captures the core visual elements
            2. Specifies artistic style and medium
            3. Describes lighting and atmosphere
            4. Details color palette and composition
            5. Maintains visual consistency with the reference material
            
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
            print(f"Error generating image prompt: {str(e)}")
            return original_prompt

    def clear_history(self):
        """Clear the prompt history"""
        self.prompt_history = []

    def get_history(self) -> List[Dict]:
        """Get the prompt generation history"""
        return self.prompt_history

    async def generate(self, prompt, search_context):
        logger.info(f"Starting image generation for prompt: {prompt}")
        try:
            logger.info(f"Using search context: {search_context[:100]}...")
            image_result = None
            
            # Use the original prompt directly without enhancement
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'http://localhost:3000/api/replicate',
                    json={
                        'prompt': prompt,  # Use original prompt directly
                        'model': 'flux-schnell',
                    }
                ) as response:
                    if response.status != 200:
                        raise Exception(f"API request failed with status {response.status}")
                    
                    data = await response.json()
                    image_result = data.get('imageUrl')
                    
                    if not image_result:
                        raise Exception("No image URL in response")

            logger.info("Image generation completed")
            return image_result
        except Exception as e:
            logger.error(f"Image generation failed: {str(e)}", exc_info=True)
            raise
