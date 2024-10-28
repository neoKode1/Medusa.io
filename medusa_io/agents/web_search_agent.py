# agents/web_search_agent.py
from typing import Dict, List
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class WebSearchAgent:
    def __init__(self, api_key: str):
        self.openai_client = OpenAI(api_key=api_key)
        self.search_history = []
        self.search_api_key = os.getenv('SEARCH_API_KEY')
        self.search_engine_id = os.getenv('SEARCH_ENGINE_ID')
        
    def search_reference_images(self, prompt: str, num_images: int = 3) -> List[str]:
        """
        Search for reference images using Google Custom Search API
        """
        try:
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': self.search_api_key,
                'cx': self.search_engine_id,
                'q': prompt,
                'searchType': 'image',
                'num': num_images
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            results = response.json()
            image_urls = [item['link'] for item in results.get('items', [])]
            
            # Store search results in history
            search_result = {
                "prompt": prompt,
                "urls": image_urls
            }
            self.search_history.append(search_result)
            
            return image_urls
            
        except Exception as e:
            print(f"Error searching for images: {str(e)}")
            return []

    def generate_enhanced_prompt(self, original_prompt: str, reference_images: List[str]) -> str:
        """
        Generate an enhanced prompt using OpenAI's API
        """
        try:
            system_message = """You are a prompt engineering expert. 
            Your task is to enhance the given prompt with detailed visual descriptions 
            while keeping it under 512 characters. Focus on specific details like colors, 
            textures, lighting, and composition."""
            
            user_message = f"""Original prompt: {original_prompt}
            
            Reference images have been analyzed. Please generate a detailed prompt that 
            captures the essence of the request while incorporating relevant visual elements.
            Keep the final prompt under 512 characters."""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ]
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating enhanced prompt: {str(e)}")
            return original_prompt

    def clear_history(self):
        """Clear the search history"""
        self.search_history = []

    def search(self, query: str) -> List[str]:
        """
        Synchronous search for reference images
        """
        logger.info(f"Performing web search for: {query[:50]}...")
        try:
            # Placeholder implementation - replace with actual search logic
            return ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
        except Exception as e:
            logger.error(f"Web search failed: {str(e)}")
            return []
            
    async def async_search(self, query: str) -> List[str]:
        """
        Asynchronous search for reference images
        """
        logger.info(f"Performing async web search for: {query[:50]}...")
        try:
            # Placeholder implementation - replace with actual async search logic
            return ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
        except Exception as e:
            logger.error(f"Async web search failed: {str(e)}")
            return []
