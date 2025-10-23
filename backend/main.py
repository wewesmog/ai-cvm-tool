from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI-CVM Tool API",
    description="AI-Powered Campaign Management Tool with Journey Persistence",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logger first
from app.shared_services.logger_setup import setup_logger
logger = setup_logger()

# Try to import and include routers
try:
    from app.routers import journey_router
    
    # Include routers
    app.include_router(journey_router.router)
    print("✅ Journey router loaded successfully")
    
except ImportError as e:
    print(f"❌ Failed to import journey router: {e}")
    logger.error(f"Failed to import journey router: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "AI-CVM Tool API is running"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI-CVM Tool API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    if logger:
        logger.error(f"Unhandled exception: {exc}")
    else:
        print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error": str(exc)
        }
    )

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting AI-CVM Tool API on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
