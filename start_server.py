import uvicorn
import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

if __name__ == "__main__":
    # Get port from environment variable (Render sets this automatically)
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "smartrentals_mvp.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )
