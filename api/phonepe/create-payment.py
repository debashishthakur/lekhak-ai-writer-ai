import os
import json
import time
import logging
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class PaymentCreateRequest(BaseModel):
    user_id: str
    plan_id: str
    amount: float
    plan_name: str

@app.post("/")
async def create_payment(request: PaymentCreateRequest):
    """Create PhonePe payment order"""
    try:
        logger.info(f"Creating payment for user: {request.user_id}, plan: {request.plan_name}")
        
        # Validate request
        if request.amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        
        if not request.user_id or not request.plan_id:
            raise HTTPException(status_code=400, detail="Missing user_id or plan_id")
        
        # Generate unique merchant order ID
        merchant_order_id = f"LEKHAK_{request.user_id[:8]}_{int(time.time())}"
        amount_paisa = int(request.amount * 100)
        
        # Get OAuth token
        access_token = await get_access_token()
        
        if not access_token:
            raise HTTPException(status_code=500, detail="Failed to get PhonePe access token")
        
        # Prepare payment request
        payment_payload = {
            "merchantOrderId": merchant_order_id,
            "amount": amount_paisa,
            "paymentFlow": "IFRAME",
            "expireAfter": 1800,  # 30 minutes
            "metaInfo": {
                "user_id": request.user_id,
                "plan_id": request.plan_id,
                "plan_name": request.plan_name,
                "source": "lekhakai_website"
            },
            "paymentModeConfig": {
                "enabledModes": ["UPI", "CARD", "NET_BANKING", "WALLET"],
                "disabledModes": []
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"O-Bearer {access_token}"
        }
        
        # Make API call to PhonePe
        checkout_url = os.getenv('PHONEPE_CHECKOUT_URL')
        response = requests.post(
            checkout_url,
            json=payment_payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            payment_data = response.json()
            
            # Store payment order in database (implement as needed)
            await store_payment_order(merchant_order_id, request, payment_data)
            
            logger.info(f"Payment order created: {merchant_order_id}")
            return {
                "success": True,
                "merchant_order_id": merchant_order_id,
                "payment_token": payment_data.get("token"),
                "expires_at": payment_data.get("expiresAt"),
                "amount": amount_paisa,
                "checkout_url": f"https://checkout.phonepe.com/v2/{payment_data.get('token')}"
            }
        else:
            logger.error(f"Payment creation failed: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail="Payment order creation failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment creation error: {e}")
        raise HTTPException(status_code=500, detail="Payment creation failed")

async def get_access_token():
    """Get OAuth access token from PhonePe"""
    try:
        auth_url = os.getenv('PHONEPE_AUTH_URL')
        payload = {
            "client_id": os.getenv('PHONEPE_CLIENT_ID'),
            "client_secret": os.getenv('PHONEPE_CLIENT_SECRET'),
            "client_version": os.getenv('PHONEPE_CLIENT_VERSION', '1'),
            "grant_type": "client_credentials"
        }
        
        response = requests.post(auth_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('access_token')
        else:
            logger.error(f"Token request failed: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Token request error: {e}")
        return None

async def store_payment_order(merchant_order_id: str, request: PaymentCreateRequest, payment_data: dict):
    """Store payment order in database"""
    # TODO: Implement Supabase storage
    logger.info(f"Storing payment order: {merchant_order_id}")
    pass

# Export the FastAPI app for Vercel
handler = app