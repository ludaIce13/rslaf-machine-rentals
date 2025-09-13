import uvicorn
import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

if __name__ == "__main__":
    uvicorn.run(
        "smartrentals_mvp.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
