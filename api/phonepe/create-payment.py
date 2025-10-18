import os
import json
import time
import requests

def handler(request):
    """Create PhonePe payment order"""
    try:
        # Parse request body
        if hasattr(request, 'get_json'):
            # Vercel request object
            body = request.get_json()
        else:
            # Parse from body
            body = json.loads(request.get('body', '{}'))
        
        # Validate request
        if not body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Request body is required'})
            }
        
        user_id = body.get('user_id')
        plan_id = body.get('plan_id')
        amount = body.get('amount')
        plan_name = body.get('plan_name')
        
        if not all([user_id, plan_id, amount, plan_name]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: user_id, plan_id, amount, plan_name'})
            }
        
        if amount <= 0:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid amount'})
            }
        
        # Generate unique merchant order ID
        merchant_order_id = f"LEKHAK_{user_id[:8]}_{int(time.time())}"
        amount_paisa = int(float(amount) * 100)
        
        # Get OAuth token
        access_token = get_access_token()
        
        if not access_token:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'Failed to get PhonePe access token'})
            }
        
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
                    'error': 'Payment order creation failed',
                    'details': response.text
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': f'Payment creation failed: {str(e)}'
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