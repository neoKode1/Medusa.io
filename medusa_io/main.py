# main.py
from fastapi import FastAPI
from api.prompt_generation import router as prompt_router

app = FastAPI()

app.include_router(prompt_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

