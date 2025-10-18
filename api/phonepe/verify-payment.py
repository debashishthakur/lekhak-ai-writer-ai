import os
import logging
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/{merchant_order_id}")
async def verify_payment(merchant_order_id: str):
    """Verify payment status with PhonePe"""
    try:
        logger.info(f"Verifying payment: {merchant_order_id}")
        
        # Get OAuth token
        access_token = await get_access_token()
        
        if not access_token:
            raise HTTPException(status_code=500, detail="Failed to get PhonePe access token")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"O-Bearer {access_token}"
        }
        
        params = {
            "details": "true"
        }
        
        status_url = f"{os.getenv('PHONEPE_STATUS_URL')}/{merchant_order_id}/status"
        
        response = requests.get(
            status_url,
            headers=headers,
            params=params,
            timeout=30
        )
        
        if response.status_code == 200:
            status_data = response.json()
            
            # Update local payment record
            await update_payment_status(merchant_order_id, status_data)
            
            logger.info(f"Payment verification successful: {merchant_order_id}")
            return {
                "success": True,
                "status_data": status_data,
                "merchant_order_id": merchant_order_id
            }
        else:
            logger.error(f"Payment verification failed: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": "Payment verification failed",
                "details": response.text
            }
            
    except Exception as e:
        logger.error(f"Payment verification error: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")

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

async def update_payment_status(merchant_order_id: str, status_data: dict):
    """Update payment status in database"""
    # TODO: Implement Supabase update
    logger.info(f"Updating payment status: {merchant_order_id}")
    pass

# Export the FastAPI app for Vercel
handler = app