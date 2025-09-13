from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Test FastAPI server is running"}

if __name__ == "__main__":
    print("Starting test FastAPI server...")
    uvicorn.run("test_fastapi:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
