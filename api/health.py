import os
import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
async def health_check():
    """Health check endpoint for PhonePe integration"""
    try:
        # Check environment variables
        required_vars = [
            'PHONEPE_CLIENT_ID',
            'PHONEPE_CLIENT_SECRET',
            'PHONEPE_MERCHANT_ID',
            'PHONEPE_WEBHOOK_URL'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "timestamp": datetime.now().isoformat(),
                    "error": f"Missing environment variables: {', '.join(missing_vars)}"
                }
            )
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "Lekhak AI PhonePe Integration",
            "version": "1.0.0",
            "environment": os.getenv('PHONEPE_ENVIRONMENT', 'PRODUCTION'),
            "merchant_id": os.getenv('PHONEPE_MERCHANT_ID'),
            "webhook_url": os.getenv('PHONEPE_WEBHOOK_URL'),
            "services": {
                "phonepe_auth": {"configured": True},
                "phonepe_payment": {"configured": True},
                "webhook_handler": {"configured": True}
            }
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
        )

# Export the FastAPI app for Vercel
handler = app