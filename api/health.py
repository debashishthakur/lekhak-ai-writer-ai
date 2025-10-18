import os
import json
from datetime import datetime

def handler(request):
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
            return {
                'statusCode': 503,
                'body': json.dumps({
                    "status": "unhealthy",
                    "timestamp": datetime.now().isoformat(),
                    "error": f"Missing environment variables: {', '.join(missing_vars)}"
                })
            }
        
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 503,
            'body': json.dumps({
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            })
        }