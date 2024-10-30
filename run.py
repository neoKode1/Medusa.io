import uvicorn
from pathlib import Path

if __name__ == "__main__":
    uvicorn.run(
        "medusa_io.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        reload_dirs=["medusa_io"],  # Only watch the medusa_io directory
        reload_excludes=["node_modules", ".git", "__pycache__", "*.pyc"]
    )
