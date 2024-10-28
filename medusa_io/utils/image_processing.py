import os
import requests
from typing import Optional

def save_temp_image(url: str, filename: str) -> Optional[str]:
    """
    Download and save an image from a URL to a temporary location
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Create temp directory if it doesn't exist
        os.makedirs('temp', exist_ok=True)
        
        filepath = os.path.join('temp', filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
            
        return filepath
    except Exception as e:
        print(f"Error saving image: {str(e)}")
        return None

