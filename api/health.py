import os
import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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
                self.send_response(503)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response_data = {
                    "status": "unhealthy",
                    "timestamp": datetime.now().isoformat(),
                    "error": f"Missing environment variables: {', '.join(missing_vars)}"
                }
                
                self.wfile.write(json.dumps(response_data).encode())
                return
            
            response_data = {
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
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }
            
            self.wfile.write(json.dumps(response_data).encode())