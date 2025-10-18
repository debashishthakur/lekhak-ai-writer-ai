import os
import json
import requests
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Verify payment status with PhonePe"""
        try:
            # Get merchant order ID from path
            path = self.path
            # Extract order ID from path like /api/phonepe/verify-payment/LEKHAK_xxx
            path_parts = path.split('/')
            if len(path_parts) < 2:
                self.send_error_response(400, {'error': 'Missing merchant order ID in path'})
                return
            
            merchant_order_id = path_parts[-1]
            
            if not merchant_order_id:
                self.send_error_response(400, {'error': 'Merchant order ID is required'})
                return
            
            # Get OAuth token
            access_token = get_access_token()
            
            if not access_token:
                self.send_error_response(500, {'error': 'Failed to get PhonePe access token'})
                return
            
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
                
                result = {
                    "success": True,
                    "status_data": status_data,
                    "merchant_order_id": merchant_order_id
                }
                
                self.send_success_response(result)
            else:
                self.send_error_response(400, {
                    'success': False,
                    'error': 'Payment verification failed',
                    'details': response.text
                })
                
        except Exception as e:
            self.send_error_response(500, {
                'success': False,
                'error': f'Payment verification failed: {str(e)}'
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
        # Check environment to use correct OAuth URL
        environment = os.getenv('PHONEPE_ENVIRONMENT', 'PRODUCTION')
        if environment == 'SANDBOX':
            auth_url = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"
        else:
            # Try the correct production OAuth URL
            auth_url = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
        
        # Prepare form data as per PhonePe documentation
        form_data = {
            "client_id": os.getenv('PHONEPE_CLIENT_ID'),
            "client_secret": os.getenv('PHONEPE_CLIENT_SECRET'),
            "client_version": os.getenv('PHONEPE_CLIENT_VERSION', '1'),
            "grant_type": "client_credentials"
        }
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        # Send POST request with form data
        response = requests.post(auth_url, data=form_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('access_token')
        else:
            print(f"OAuth failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"OAuth error: {e}")
        return None