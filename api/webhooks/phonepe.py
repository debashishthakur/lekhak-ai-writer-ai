import os
import json
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler
from supabase import create_client, Client

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle PhonePe webhooks"""
        try:
            # Get webhook data
            authorization_header = self.headers.get('Authorization', '')
            
            # Get webhook body
            content_length = int(self.headers.get('Content-Length', 0))
            webhook_body_bytes = self.rfile.read(content_length)
            webhook_body = webhook_body_bytes.decode('utf-8')
            
            # Verify webhook authenticity
            if not verify_webhook_signature(authorization_header, webhook_body_bytes):
                self.send_error_response(401, {'error': 'Invalid webhook signature'})
                return
            
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
            
            response_data = {
                "status": "success",
                "message": "Webhook processed",
                "event": event_type
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, {
                'error': f'Webhook processing failed: {str(e)}'
            })
    
    def send_success_response(self, data):
        """Send successful response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, status_code, data):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

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
        phonepe_order_id = payload.get('orderId')
        
        if payment_state == 'COMPLETED':
            # Update payment status in database
            update_payment_status(merchant_order_id, 'COMPLETED', payload)
            
            # Activate subscription for user
            activate_user_subscription(merchant_order_id, payload)
            
            print(f"Payment completed and subscription activated: {merchant_order_id}")
        
    except Exception as e:
        print(f"Error handling successful payment: {e}")

def handle_failed_payment(payload):
    """Handle failed payment webhook"""
    try:
        merchant_order_id = payload.get('merchantOrderId')
        error_code = payload.get('errorCode')
        
        # Update payment status in database
        update_payment_status(merchant_order_id, 'FAILED', payload)
        
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

def get_supabase_client():
    """Get Supabase client"""
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    return create_client(url, key)

def update_payment_status(merchant_order_id: str, status: str, webhook_payload: dict):
    """Update payment status in database"""
    try:
        supabase = get_supabase_client()
        
        update_data = {
            "state": status,
            "payment_details": webhook_payload,
            "callback_received_at": "now()"
        }
        
        result = supabase.table('phonepe_transactions')\
            .update(update_data)\
            .eq('merchant_order_id', merchant_order_id)\
            .execute()
            
        print(f"Payment status updated: {merchant_order_id} -> {status}")
        return result
        
    except Exception as e:
        print(f"Database error updating payment status: {e}")
        return None

def activate_user_subscription(merchant_order_id: str, webhook_payload: dict):
    """Activate user subscription after successful payment"""
    try:
        supabase = get_supabase_client()
        
        # Get payment transaction details
        payment_result = supabase.table('phonepe_transactions')\
            .select('*')\
            .eq('merchant_order_id', merchant_order_id)\
            .single()\
            .execute()
            
        if payment_result.data:
            payment = payment_result.data
            user_id = payment['user_id']
            
            # Get plan details based on payment amount
            amount_paisa = payment['amount_paisa']
            
            # Determine plan based on amount
            if amount_paisa == 5900:  # ₹59
                plan_name = 'Trial'
                plan_id_query = supabase.table('subscription_plans').select('id').eq('name', 'Free').single().execute()
            elif amount_paisa == 39900:  # ₹399
                plan_name = 'Pro' 
                plan_id_query = supabase.table('subscription_plans').select('id').eq('name', 'Pro').single().execute()
            elif amount_paisa == 159900:  # ₹1599
                plan_name = 'Unlimited'
                plan_id_query = supabase.table('subscription_plans').select('id').eq('name', 'Unlimited').single().execute()
            else:
                print(f"Unknown plan amount: {amount_paisa}")
                return None
                
            if not plan_id_query.data:
                print(f"Plan not found: {plan_name}")
                return None
                
            plan_id = plan_id_query.data['id']
            
            # Calculate subscription expiry (30 days from now)
            import datetime
            expires_at = datetime.datetime.now() + datetime.timedelta(days=30)
            
            # Create or update user subscription
            subscription_data = {
                "user_id": user_id,
                "plan_id": plan_id,
                "status": "active",
                "billing_cycle": "monthly",
                "phonepe_merchant_order_id": merchant_order_id,
                "started_at": "now()",
                "current_period_start": "now()",
                "current_period_end": expires_at.isoformat()
            }
            
            # Check if user already has a subscription
            existing_sub = supabase.table('user_subscriptions')\
                .select('*')\
                .eq('user_id', user_id)\
                .eq('status', 'active')\
                .execute()
                
            if existing_sub.data:
                # Update existing subscription
                result = supabase.table('user_subscriptions')\
                    .update(subscription_data)\
                    .eq('user_id', user_id)\
                    .eq('status', 'active')\
                    .execute()
                print(f"Updated subscription for user: {user_id}")
            else:
                # Create new subscription
                result = supabase.table('user_subscriptions')\
                    .insert(subscription_data)\
                    .execute()
                print(f"Created new subscription for user: {user_id}")
                
            return result
        
    except Exception as e:
        print(f"Database error activating subscription: {e}")
        return None