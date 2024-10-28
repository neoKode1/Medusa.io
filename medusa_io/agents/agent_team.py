from typing import List, Dict
from .web_search_agent import WebSearchAgent
from .text_to_image_agent import TextToImageAgent
from .text_to_video_agent import TextToVideoAgent
from openai import OpenAI
import os
import logging
import time
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentTeam:
    def __init__(self, config: Dict):
        """
        Initialize the agent team with configuration using OpenAI's model
        """
        try:
            logger.info("Initializing OpenAI client...")
            api_key = config.get('openai_api_key')
            
            if not api_key:
                raise ValueError("OpenAI API key is required")
                
            if not api_key.startswith('sk-'):
                raise ValueError("Invalid OpenAI API key format")
                
            self.openai_client = OpenAI(api_key=api_key)
            
            # Test the API key with a simple completion using gpt-3.5-turbo instead of gpt-4
            try:
                self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",  # Changed from gpt-4 to gpt-3.5-turbo
                    messages=[{"role": "user", "content": "test"}],
                    max_tokens=5
                )
                logger.info("OpenAI API key validated successfully")
            except Exception as api_error:
                logger.error(f"Failed to validate OpenAI API key: {str(api_error)}")
                raise ValueError(f"Invalid OpenAI API key: {str(api_error)}")
            
            # Initialize reference data
            self.reference_data = {
                'genres': {
                    'horror': ['The Shining', 'Get Out', 'A Nightmare on Elm Street', 'The Exorcist', 'Hereditary'],
                    'comedy': ['Groundhog Day', 'Superbad', 'Bridesmaids', 'The Big Lebowski', 'Shaun of the Dead'],
                    'drama': ['The Godfather', 'The Shawshank Redemption', "Schindler's List", 'Forrest Gump', '12 Years a Slave'],
                    'suspense': ['Gone Girl', 'Inception', 'No Country for Old Men', 'Memento', 'Rear Window'],
                    'mystery': ['Seven', 'Knives Out', 'Chinatown', 'Mystic River', 'L.A. Confidential']
                },
                'books': [
                    'To Kill a Mockingbird', '1984', 'The Great Gatsby', 
                    'Harry Potter and the Philosopher\'s Stone', 'The Catcher in the Rye',
                    'Pride and Prejudice', 'The Lord of the Rings', 'The Alchemist',
                    'The Da Vinci Code', 'The Hunger Games'
                ]
            }
            
            logger.info("Initializing agents...")
            self.web_search_agent = WebSearchAgent(api_key)
            self.text_to_video_agent = TextToVideoAgent()
            self.text_to_image_agent = TextToImageAgent()
            
            logger.info("AgentTeam initialization complete")
            
        except Exception as e:
            logger.error(f"Error initializing AgentTeam: {str(e)}")
            raise
        
    def process_prompt(self, prompt: str, mode: str, influences: Dict = None) -> Dict:
        """
        Process the prompt with influences and return enhanced results
        """
        logger.info(f"Processing prompt: {prompt[:50]}... with mode: {mode}")
        logger.info(f"Influences: {influences}")
        
        try:
            # Generate influence-based context
            context = self._generate_context(influences)
            enhanced_prompt = self._enhance_prompt_with_context(prompt, context)
            
            # Get reference images from web search
            logger.info("Performing web search for reference images...")
            reference_images = self.web_search_agent.search_reference_images(enhanced_prompt)
            
            # Select appropriate agent
            if mode == "video":
                logger.info("Using video agent for prompt enhancement")
                final_prompt = self.text_to_video_agent.generate_video_prompt(
                    enhanced_prompt, reference_images
                )
                agent_used = "text_to_video"
            else:
                logger.info("Using image agent for prompt enhancement")
                final_prompt = self.text_to_image_agent.generate_image_prompt(
                    enhanced_prompt, reference_images
                )
                agent_used = "text_to_image"
            
            result = {
                "original_prompt": prompt,
                "enhanced_prompt": final_prompt,
                "reference_images": reference_images,
                "mode": mode,
                "agent_used": agent_used,
                "influences": influences,
                "error": None
            }
            
            logger.info(f"Returning result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing prompt: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "original_prompt": prompt,
                "enhanced_prompt": prompt,
                "reference_images": [],
                "mode": mode,
                "agent_used": "",
                "influences": influences,
                "error": str(e)
            }

    def _generate_context(self, influences: Dict) -> str:
        """Generate context string from influences"""
        if not influences:
            return ""
            
        context_parts = []
        
        if genre := influences.get('genre'):
            if genre_movies := self.reference_data['genres'].get(genre.lower()):
                context_parts.append(f"Genre: {genre}, similar to {', '.join(genre_movies[:2])}")
                
        if reference := influences.get('reference'):
            context_parts.append(f"Reference work: {reference}")
            
        if style := influences.get('style'):
            context_parts.append(f"Style: {style}")
            
        return ". ".join(context_parts)

    def _enhance_prompt_with_context(self, prompt: str, context: str) -> str:
        """Enhance the prompt using the context"""
        try:
            system_message = """You are a creative prompt engineer specializing in visual content generation. 
            Your task is to enhance the given prompt by incorporating elements from the provided genre, 
            reference work, and style. DO NOT return the original prompt unchanged. Instead, create a 
            detailed, vivid description that maintains the core concept while adding specific visual elements.
            
            For example:
            If given "a wolf" with horror genre and artistic style, don't return "a wolf" - instead create 
            something like "A menacing wolf emerging from misty shadows, rendered in bold artistic strokes, 
            with glowing red eyes and dark textural fur details"."""
            
            user_message = f"""Original prompt: {prompt}
            
            Context and Influences:
            {context}
            
            Create a detailed, enhanced prompt that:
            1. Maintains the core concept of "{prompt}"
            2. Incorporates the mood and atmosphere from the genre
            3. Draws inspiration from the reference work's style and themes
            4. Adds specific visual details and artistic elements
            5. Makes it more vivid and descriptive
            
            The enhanced prompt should be a single, detailed paragraph."""
            
            logger.info(f"Sending to OpenAI - Prompt: {prompt}, Context: {context}")
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",  # Changed from gpt-4 to gpt-3.5-turbo
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.8,
                max_tokens=200,
                presence_penalty=0.6,
                frequency_penalty=0.3
            )
            
            enhanced_prompt = response.choices[0].message.content.strip()
            logger.info(f"Enhanced prompt: {enhanced_prompt}")
            
            # If the prompt wasn't enhanced, try one more time
            if enhanced_prompt == prompt:
                logger.warning("First attempt returned unchanged prompt, trying again...")
                
                retry_response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",  # Changed from gpt-4 to gpt-3.5-turbo
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.9,
                    max_tokens=200
                )
                
                enhanced_prompt = retry_response.choices[0].message.content.strip()
                logger.info(f"Retry enhanced prompt: {enhanced_prompt}")
            
            return enhanced_prompt
            
        except Exception as e:
            logger.error(f"Error in prompt enhancement: {str(e)}")
            logger.error(traceback.format_exc())
            return f"{prompt} [Enhancement failed: {str(e)}]"
        
    async def process_request(self, prompt):
        logger.info(f"Starting request processing with prompt: {prompt}")
        try:
            start_time = time.time()
            
            logger.info("Starting web search")
            search_results = await self.web_search_agent.search(prompt)
            logger.info(f"Web search completed. Found {len(search_results)} results")

            logger.info("Generating image from prompt")
            image_result = await self.text_to_image_agent.generate(prompt, search_results)
            logger.info("Image generation completed")

            logger.info("Starting video generation")
            video_result = await self.text_to_video_agent.generate(prompt, image_result)
            logger.info("Video generation completed")

            execution_time = time.time() - start_time
            logger.info(f"Total processing time: {execution_time:.2f} seconds")
            
            return video_result
        except Exception as e:
            logger.error(f"Error in process_request: {str(e)}", exc_info=True)
            raise
        
    def clear_history(self):
        """Clear history from all agents"""
        self.web_search_agent.clear_history()
        self.text_to_video_agent.clear_history()
        self.text_to_image_agent.clear_history()
