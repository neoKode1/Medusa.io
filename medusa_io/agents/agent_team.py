from typing import List, Dict
from .web_search_agent import WebSearchAgent
from .text_to_image_agent import TextToImageAgent
from .text_to_video_agent import TextToVideoAgent

agent_team = Agent(
    team=[web_search_agent, text_to_video_agent, text_to_image_agent],
    show_tool_calls=True,
    markdown=True,
)

class AgentTeam:
    def __init__(self, config: Dict):
        """
        Initialize the agent team with configuration
        
        Args:
            config: Dictionary containing API keys and other configuration
        """
        self.openai_api_key = config.get('openai_api_key')
        self.web_search_agent = WebSearchAgent(self.openai_api_key)
        self.text_to_video_agent = TextToVideoAgent()
        self.text_to_image_agent = TextToImageAgent()
        
    def process_prompt(self, prompt: str, mode: str = "image") -> Dict:
        """
        Process a user prompt through the web search and enhancement pipeline
        """
        try:
            # Search for reference images
            reference_images = self.web_search_agent.search_reference_images(prompt)
            
            # Generate enhanced prompt based on mode
            if mode == "video":
                enhanced_prompt = self.text_to_video_agent.generate_video_prompt(
                    prompt, 
                    reference_images
                )
            else:  # default to image
                enhanced_prompt = self.text_to_image_agent.generate_image_prompt(
                    prompt, 
                    reference_images
                )
            
            return {
                "original_prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "reference_images": reference_images,
                "mode": mode
            }
            
        except Exception as e:
            print(f"Error processing prompt: {str(e)}")
            return {
                "original_prompt": prompt,
                "enhanced_prompt": prompt,
                "reference_images": [],
                "mode": mode,
                "error": str(e)
            }
        
    def clear_history(self):
        """Clear history from all agents"""
        self.web_search_agent.clear_history()
        self.text_to_video_agent.clear_history()
        self.text_to_image_agent.clear_history()
