from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Create a simple FastAPI app for testing
app = FastAPI(title="Test API")

@app.get("/")
async def root():
    return {"message": "Test API is working"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


