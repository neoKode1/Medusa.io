# main.py
from fastapi import FastAPI
from api.prompt_generation import router as prompt_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('medusa.log'),
        logging.StreamHandler()
    ]
)

app = FastAPI()

app.include_router(prompt_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
