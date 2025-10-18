import os
import json
import requests

def handler(request):
    """Verify payment status with PhonePe"""
    try:
        # Get merchant order ID from path
        path = request.get('path', '')
        # Extract order ID from path like /api/phonepe/verify-payment/LEKHAK_xxx
        path_parts = path.split('/')
        if len(path_parts) < 2:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing merchant order ID in path'})
            }
        
        merchant_order_id = path_parts[-1]
        
        if not merchant_order_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Merchant order ID is required'})
            }
        
        # Get OAuth token
        access_token = get_access_token()
        
        if not access_token:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to get PhonePe access token'})
            }
        
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
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'success': False,
                    'error': 'Payment verification failed',
                    'details': response.text
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': f'Payment verification failed: {str(e)}'
            })
        }

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