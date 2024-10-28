from phi.agent import Agent
from phi.model.openai import OpenAIChat
from typing import Dict, List
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

text_to_video_agent = Agent(
    name="Text to Video Agent",
    role="Write prompts for text-to-video generation",
    model=OpenAIChat(id="gpt-4"),
    markdown=True,
)


class TextToVideoAgent:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.prompt_history = []

    def generate_video_prompt(self, original_prompt: str, reference_images: List[str]) -> str:
        """
        Generate an enhanced video prompt using OpenAI's API
        """
        try:
            system_message = """You are a video prompt engineering expert. 
            Your task is to enhance the given prompt with detailed descriptions suitable for video generation.
            Focus on movement, timing, transitions, camera angles, and dynamic elements.
            Keep the final prompt under 512 characters while maintaining rich detail."""

            user_message = f"""Original prompt: {original_prompt}

            Reference images have been analyzed. Please generate a detailed video prompt that:
            1. Captures the core visual elements from the reference images
            2. Adds dynamic elements and movement
            3. Specifies camera movements and transitions
            4. Describes timing and pacing
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
            print(f"Error generating video prompt: {str(e)}")
            return original_prompt

    def clear_history(self):
        """Clear the prompt history"""
        self.prompt_history = []

    def get_history(self) -> List[Dict]:
        """Get the prompt generation history"""
        return self.prompt_history
