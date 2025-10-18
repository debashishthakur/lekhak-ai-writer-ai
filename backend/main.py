import os
import logging
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

# Import our services
from services.phonepe_auth import phonepe_auth
from services.phonepe_payment import phonepe_payment
from services.phonepe_webhook import webhook_handler
from services.supabase_rest_client import supabase_service

load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Lekhak AI PhonePe Integration",
    description="Production PhonePe payment gateway integration for Lekhak AI subscriptions",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('ALLOWED_ORIGINS', '').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PaymentCreateRequest(BaseModel):
    user_id: str
    plan_id: str
    amount: float
    plan_name: str

class RefundRequest(BaseModel):
    merchant_order_id: str
    amount: float
    reason: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, Any]

# Health check endpoint
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with service status"""
    try:
        # Check PhonePe auth status
        auth_status = phonepe_auth.get_token_info()
        
        # Check payment service status
        payment_status = phonepe_payment.get_service_info()
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            services={
                "phonepe_auth": auth_status,
                "phonepe_payment": {
                    "merchant_id": payment_status["merchant_id"],
                    "configured": True
                },
                "webhook_handler": {
                    "configured": True,
                    "supported_events": len(webhook_handler.event_handlers)
                }
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

# Payment creation endpoint
@app.post("/api/phonepe/create-payment")
async def create_payment(request: PaymentCreateRequest):
    """Create PhonePe payment order"""
    try:
        logger.info(f"Creating payment for user: {request.user_id}, plan: {request.plan_name}")
        
        # Validate request
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        
        if not request.user_id or not request.plan_id:
            raise HTTPException(status_code=400, detail="Missing user_id or plan_id")
        
        # Create payment order
        result = phonepe_payment.create_payment_order(
            user_id=request.user_id,
            plan_id=request.plan_id,
            amount_rupees=request.amount,
            plan_name=request.plan_name
        )
        
        if result["success"]:
            logger.info(f"Payment order created: {result['merchant_order_id']}")
            return result
        else:
            logger.error(f"Payment creation failed: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail="Payment creation failed")

# Payment token endpoint (for iframe)
@app.get("/api/phonepe/get-token/{merchant_order_id}")
async def get_payment_token(merchant_order_id: str):
    """Get payment token for iframe integration"""
    try:
        # In a real implementation, you'd retrieve the token from database
        # For now, we'll return a success response
        logger.info(f"Token requested for order: {merchant_order_id}")
        
        return {
            "success": True,
            "token": "payment_token_placeholder",
            "merchant_order_id": merchant_order_id
        }
        
    except Exception as e:
        logger.error(f"Token retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Token retrieval failed")

# Payment verification endpoint
@app.get("/api/phonepe/verify-payment/{merchant_order_id}")
async def verify_payment(merchant_order_id: str):
    """Verify payment status"""
    try:
        logger.info(f"Verifying payment: {merchant_order_id}")
        
        # Check payment status with PhonePe
        result = phonepe_payment.check_payment_status(
            merchant_order_id=merchant_order_id,
            include_details=True
        )
        
        if result["success"]:
            logger.info(f"Payment verification successful: {merchant_order_id} - {result.get('state')}")
            return result
        else:
            logger.error(f"Payment verification failed: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

# Webhook endpoint
@app.post("/api/webhooks/phonepe")
async def phonepe_webhook(request: Request):
    """Handle PhonePe webhooks"""
    try:
        logger.info("PhonePe webhook received")
        
        # Process webhook using our handler
        result = await webhook_handler.process_webhook(request)
        
        logger.info(f"Webhook processed successfully: {result.get('event')}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

# Refund endpoint
@app.post("/api/phonepe/refund")
async def process_refund(request: RefundRequest):
    """Process refund using PhonePe"""
    try:
        logger.info(f"Processing refund for order: {request.merchant_order_id}")
        
        # Validate request
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid refund amount")
        
        # Process refund
        result = phonepe_payment.initiate_refund(
            original_merchant_order_id=request.merchant_order_id,
            refund_amount=request.amount,
            reason=request.reason
        )
        
        if result["success"]:
            logger.info(f"Refund initiated: {result['merchant_refund_id']}")
            return result
        else:
            logger.error(f"Refund failed: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refund processing error: {e}")
        raise HTTPException(status_code=500, detail="Refund processing failed")

# Order status endpoint
@app.get("/api/phonepe/order-status/{merchant_order_id}")
async def get_order_status(merchant_order_id: str, details: bool = True):
    """Get order status from PhonePe"""
    try:
        logger.info(f"Checking order status: {merchant_order_id}")
        
        result = phonepe_payment.check_payment_status(
            merchant_order_id=merchant_order_id,
            include_details=details
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Order status check error: {e}")
        raise HTTPException(status_code=500, detail="Order status check failed")

# Service info endpoint
@app.get("/api/phonepe/service-info")
async def get_service_info():
    """Get PhonePe service configuration info"""
    try:
        return {
            "service": "Lekhak AI PhonePe Integration",
            "version": "1.0.0",
            "environment": os.getenv('PHONEPE_ENVIRONMENT', 'PRODUCTION'),
            "merchant_id": os.getenv('PHONEPE_MERCHANT_ID'),
            "webhook_url": os.getenv('PHONEPE_WEBHOOK_URL'),
            "supported_events": len(webhook_handler.event_handlers),
            "auth_status": phonepe_auth.get_token_info()
        }
    except Exception as e:
        logger.error(f"Service info error: {e}")
        raise HTTPException(status_code=500, detail="Service info unavailable")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail} - {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled error: {exc} - {request.url}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info("Starting Lekhak AI PhonePe Integration Service")
    
    try:
        # Validate PhonePe credentials
        if phonepe_auth.validate_credentials():
            logger.info("✅ PhonePe credentials validated successfully")
        else:
            logger.error("❌ PhonePe credentials validation failed")
            
        # Log service configuration
        service_info = phonepe_payment.get_service_info()
        logger.info(f"Service configured with merchant ID: {service_info['merchant_id']}")
        logger.info(f"Webhook handler supports {len(webhook_handler.event_handlers)} events")
        
    except Exception as e:
        logger.error(f"Startup validation failed: {e}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks"""
    logger.info("Shutting down Lekhak AI PhonePe Integration Service")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Lekhak AI PhonePe Integration",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )