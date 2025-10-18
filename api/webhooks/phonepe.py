import os
import json
import hashlib
import hmac
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.post("/")
async def phonepe_webhook(request: Request):
    """Handle PhonePe webhooks"""
    try:
        logger.info("PhonePe webhook received")
        
        # Get webhook data
        authorization_header = request.headers.get('Authorization', '')
        webhook_body = await request.body()
        
        # Verify webhook authenticity
        if not verify_webhook_signature(authorization_header, webhook_body):
            logger.error("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse webhook data
        webhook_data = json.loads(webhook_body.decode('utf-8'))
        event_type = webhook_data.get('event')
        payload = webhook_data.get('payload', {})
        
        logger.info(f"Processing webhook event: {event_type}")
        
        # Process different event types
        if event_type == 'checkout.order.completed':
            await handle_successful_payment(payload)
        elif event_type == 'checkout.order.failed':
            await handle_failed_payment(payload)
        elif event_type == 'pg.refund.completed':
            await handle_successful_refund(payload)
        elif event_type == 'pg.refund.failed':
            await handle_failed_refund(payload)
        else:
            logger.warning(f"Unknown webhook event: {event_type}")
        
        logger.info(f"Webhook processed successfully: {event_type}")
        return {
            "status": "success",
            "message": "Webhook processed",
            "event": event_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

def verify_webhook_signature(auth_header: str, webhook_body: bytes) -> bool:
    """Verify webhook signature using SHA256"""
    try:
        if not auth_header.startswith('SHA256'):
            return False
        
        received_signature = auth_header.split(' ', 1)[1]
        webhook_password = os.getenv('PHONEPE_WEBHOOK_PASSWORD')
        
        # Calculate expected signature
        message = webhook_body + webhook_password.encode('utf-8')
        expected_signature = hashlib.sha256(message).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(received_signature, expected_signature)
        
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False

async def handle_successful_payment(payload: dict):
    """Handle successful payment webhook"""
    try:
        merchant_order_id = payload.get('merchantOrderId')
        payment_state = payload.get('state')
        amount = payload.get('amount')
        
        logger.info(f"Processing successful payment: {merchant_order_id}")
        
        if payment_state == 'COMPLETED':
            # Activate subscription
            await activate_subscription(merchant_order_id, payload)
            logger.info(f"Payment completed and subscription activated: {merchant_order_id}")
        
    except Exception as e:
        logger.error(f"Error handling successful payment: {e}")

async def handle_failed_payment(payload: dict):
    """Handle failed payment webhook"""
    try:
        merchant_order_id = payload.get('merchantOrderId')
        error_code = payload.get('errorCode')
        
        logger.warning(f"Processing failed payment: {merchant_order_id} - {error_code}")
        
        # Update payment status
        await update_payment_failure(merchant_order_id, payload)
        
    except Exception as e:
        logger.error(f"Error handling failed payment: {e}")

async def handle_successful_refund(payload: dict):
    """Handle successful refund webhook"""
    try:
        refund_id = payload.get('refundId')
        merchant_refund_id = payload.get('merchantRefundId')
        
        logger.info(f"Processing successful refund: {refund_id}")
        
        # Process refund completion
        await complete_refund(merchant_refund_id, payload)
        
    except Exception as e:
        logger.error(f"Error handling successful refund: {e}")

async def handle_failed_refund(payload: dict):
    """Handle failed refund webhook"""
    try:
        merchant_refund_id = payload.get('merchantRefundId')
        error_code = payload.get('errorCode')
        
        logger.warning(f"Processing failed refund: {merchant_refund_id} - {error_code}")
        
        # Update refund failure
        await update_refund_failure(merchant_refund_id, payload)
        
    except Exception as e:
        logger.error(f"Error handling failed refund: {e}")

async def activate_subscription(merchant_order_id: str, payload: dict):
    """Activate user subscription after successful payment"""
    # TODO: Implement subscription activation with Supabase
    logger.info(f"Activating subscription for order: {merchant_order_id}")
    pass

async def update_payment_failure(merchant_order_id: str, payload: dict):
    """Update payment failure status"""
    # TODO: Implement payment failure handling with Supabase
    logger.info(f"Updating payment failure for order: {merchant_order_id}")
    pass

async def complete_refund(merchant_refund_id: str, payload: dict):
    """Complete refund processing"""
    # TODO: Implement refund completion with Supabase
    logger.info(f"Completing refund: {merchant_refund_id}")
    pass

async def update_refund_failure(merchant_refund_id: str, payload: dict):
    """Update refund failure status"""
    # TODO: Implement refund failure handling with Supabase
    logger.info(f"Updating refund failure: {merchant_refund_id}")
    pass

# Export the FastAPI app for Vercel
handler = app