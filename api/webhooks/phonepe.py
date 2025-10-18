import os
import json
import hashlib
import hmac

def handler(request):
    """Handle PhonePe webhooks"""
    try:
        # Get webhook data
        headers = request.get('headers', {})
        authorization_header = headers.get('Authorization', '') or headers.get('authorization', '')
        
        # Get webhook body
        webhook_body = request.get('body', '')
        if isinstance(webhook_body, str):
            webhook_body_bytes = webhook_body.encode('utf-8')
        else:
            webhook_body_bytes = webhook_body
        
        # Verify webhook authenticity
        if not verify_webhook_signature(authorization_header, webhook_body_bytes):
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Invalid webhook signature'})
            }
        
        # Parse webhook data
        webhook_data = json.loads(webhook_body)
        event_type = webhook_data.get('event')
        payload = webhook_data.get('payload', {})
        
        # Process different event types
        if event_type == 'checkout.order.completed':
            handle_successful_payment(payload)
        elif event_type == 'checkout.order.failed':
            handle_failed_payment(payload)
        elif event_type == 'pg.refund.completed':
            handle_successful_refund(payload)
        elif event_type == 'pg.refund.failed':
            handle_failed_refund(payload)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                "status": "success",
                "message": "Webhook processed",
                "event": event_type
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Webhook processing failed: {str(e)}'
            })
        }

def verify_webhook_signature(auth_header, webhook_body_bytes):
    """Verify webhook signature using SHA256"""
    try:
        if not auth_header.startswith('SHA256'):
            return False
        
        received_signature = auth_header.split(' ', 1)[1]
        webhook_password = os.getenv('PHONEPE_WEBHOOK_PASSWORD')
        
        if not webhook_password:
            return False
        
        # Calculate expected signature
        message = webhook_body_bytes + webhook_password.encode('utf-8')
        expected_signature = hashlib.sha256(message).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(received_signature, expected_signature)
        
    except Exception as e:
        return False

def handle_successful_payment(payload):
    """Handle successful payment webhook"""
    try:
        merchant_order_id = payload.get('merchantOrderId')
        payment_state = payload.get('state')
        amount = payload.get('amount')
        
        if payment_state == 'COMPLETED':
            # TODO: Activate subscription in database
            print(f"Payment completed: {merchant_order_id}")
        
    except Exception as e:
        print(f"Error handling successful payment: {e}")

def handle_failed_payment(payload):
    """Handle failed payment webhook"""
    try:
        merchant_order_id = payload.get('merchantOrderId')
        error_code = payload.get('errorCode')
        
        # TODO: Update payment status in database
        print(f"Payment failed: {merchant_order_id} - {error_code}")
        
    except Exception as e:
        print(f"Error handling failed payment: {e}")

def handle_successful_refund(payload):
    """Handle successful refund webhook"""
    try:
        refund_id = payload.get('refundId')
        merchant_refund_id = payload.get('merchantRefundId')
        
        # TODO: Process refund completion in database
        print(f"Refund completed: {refund_id}")
        
    except Exception as e:
        print(f"Error handling successful refund: {e}")

def handle_failed_refund(payload):
    """Handle failed refund webhook"""
    try:
        merchant_refund_id = payload.get('merchantRefundId')
        error_code = payload.get('errorCode')
        
        # TODO: Update refund failure in database
        print(f"Refund failed: {merchant_refund_id} - {error_code}")
        
    except Exception as e:
        print(f"Error handling failed refund: {e}")