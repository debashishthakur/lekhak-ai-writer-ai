import os
import json
import time
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Create PhonePe payment order"""
        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode('utf-8'))
            
            # Validate request
            if not body:
                self.send_error_response(400, {'error': 'Request body is required'})
                return
            
            user_id = body.get('user_id')
            plan_id = body.get('plan_id')
            amount = body.get('amount')
            plan_name = body.get('plan_name')
            
            if not all([user_id, plan_id, amount, plan_name]):
                self.send_error_response(400, {'error': 'Missing required fields: user_id, plan_id, amount, plan_name'})
                return
            
            if amount <= 0:
                self.send_error_response(400, {'error': 'Invalid amount'})
                return
            
            # Generate unique merchant order ID
            merchant_order_id = f"LEKHAK_{user_id[:8]}_{int(time.time())}"
            amount_paisa = int(float(amount) * 100)
            
            # Get OAuth token
            access_token = get_access_token()
            
            if not access_token:
                self.send_error_response(500, {'error': 'Failed to get PhonePe access token'})
                return
            
            # Prepare payment request
            payment_payload = {
                "merchantOrderId": merchant_order_id,
                "amount": amount_paisa,
                "paymentFlow": "IFRAME",
                "expireAfter": 1800,  # 30 minutes
                "metaInfo": {
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
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
                
                result = {
                    "success": True,
                    "merchant_order_id": merchant_order_id,
                    "payment_token": payment_data.get("token"),
                    "expires_at": payment_data.get("expiresAt"),
                    "amount": amount_paisa,
                    "checkout_url": f"https://checkout.phonepe.com/v2/{payment_data.get('token')}"
                }
                
                self.send_success_response(result)
            else:
                self.send_error_response(400, {
                    'success': False,
                    'error': 'Payment order creation failed',
                    'details': response.text
                })
                
        except Exception as e:
            self.send_error_response(500, {
                'success': False,
                'error': f'Payment creation failed: {str(e)}'
            })
    
    def send_success_response(self, data):
        """Send successful response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, status_code, data):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

def get_access_token():
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
            return None
            
    except Exception as e:
        return None