from fastapi import FastAPI
from .prompt_generation import router as prompt_router

app = FastAPI(
    title="Medusa.io API",
    description="API for prompt generation and enhancement",
    version="1.0.0"
)

# Include routers
app.include_router(prompt_router, prefix="/api", tags=["prompts"])

