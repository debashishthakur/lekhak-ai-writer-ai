import os
import time
import uuid
import requests
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
from .phonepe_auth import phonepe_auth

load_dotenv()

class PhonePePaymentService:
    """Production PhonePe Payment Service with Direct API Integration"""
    
    def __init__(self):
        self.merchant_id = os.getenv('PHONEPE_MERCHANT_ID')
        self.checkout_url = os.getenv('PHONEPE_CHECKOUT_URL')
        self.status_url = os.getenv('PHONEPE_STATUS_URL')
        self.refund_url = os.getenv('PHONEPE_REFUND_URL')
        self.success_url = os.getenv('SUCCESS_URL')
        self.failure_url = os.getenv('FAILURE_URL')
        
        self.logger = logging.getLogger(__name__)
        
        # Validate required configuration
        if not all([self.merchant_id, self.checkout_url, self.status_url]):
            raise ValueError("Missing required PhonePe API configuration")
    
    def create_payment_order(self, user_id: str, plan_id: str, amount_rupees: float, plan_name: str) -> Dict[str, Any]:
        """
        Create payment order using PhonePe API
        
        Args:
            user_id: User identifier
            plan_id: Subscription plan ID  
            amount_rupees: Amount in rupees
            plan_name: Name of the plan
            
        Returns:
            Payment order response with token and URLs
        """
        try:
            # Generate unique merchant order ID
            timestamp = int(time.time())
            user_hash = user_id[:8] if len(user_id) >= 8 else user_id
            merchant_order_id = f"LEKHAK_{user_hash}_{timestamp}"
            
            # Convert to paisa and add GST (18%)
            base_amount = amount_rupees
            gst_amount = base_amount * 0.18
            total_amount = base_amount + gst_amount
            amount_paisa = int(total_amount * 100)
            
            # Get fresh access token
            access_token = phonepe_auth.get_access_token()
            
            # Prepare payment request
            payment_payload = {
                "merchantId": self.merchant_id,
                "merchantOrderId": merchant_order_id,
                "amount": amount_paisa,
                "paymentFlow": "IFRAME",
                "expireAfter": 1800,  # 30 minutes
                "redirectUrl": self.success_url,
                "callbackUrl": f"https://www.lekhakai.com/api/webhooks/phonepe",
                "metaInfo": {
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "plan_name": plan_name,
                    "source": "lekhakai_website",
                    "base_amount": base_amount,
                    "gst_amount": gst_amount,
                    "total_amount": total_amount
                },
                "paymentModeConfig": {
                    "enabledModes": ["UPI", "CARD", "NET_BANKING", "WALLET"],
                    "disabledModes": []
                }
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"O-Bearer {access_token}",
                "Accept": "application/json"
            }
            
            self.logger.info(f"Creating payment order: {merchant_order_id} for ₹{total_amount}")
            
            # Make API call
            response = requests.post(
                self.checkout_url,
                json=payment_payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                payment_data = response.json()
                
                self.logger.info(f"Payment order created successfully: {merchant_order_id}")
                
                return {
                    "success": True,
                    "merchant_order_id": merchant_order_id,
                    "payment_token": payment_data.get("token"),
                    "payment_url": payment_data.get("paymentUrl"),
                    "expires_at": payment_data.get("expiresAt"),
                    "amount_paisa": amount_paisa,
                    "amount_rupees": total_amount,
                    "base_amount": base_amount,
                    "gst_amount": gst_amount,
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "plan_name": plan_name
                }
            else:
                error_msg = f"Payment creation failed: {response.status_code} - {response.text}"
                self.logger.error(error_msg)
                return {
                    "success": False,
                    "error": "Payment order creation failed",
                    "details": response.text,
                    "status_code": response.status_code
                }
                
        except Exception as e:
            self.logger.error(f"Payment creation error: {e}")
            return {
                "success": False,
                "error": "Payment creation failed",
                "details": str(e)
            }
    
    def check_payment_status(self, merchant_order_id: str, include_details: bool = True) -> Dict[str, Any]:
        """Check payment status using PhonePe API"""
        try:
            access_token = phonepe_auth.get_access_token()
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"O-Bearer {access_token}",
                "Accept": "application/json"
            }
            
            params = {
                "details": "true" if include_details else "false"
            }
            
            status_endpoint = f"{self.status_url}/{merchant_order_id}/status"
            
            self.logger.info(f"Checking payment status: {merchant_order_id}")
            
            response = requests.get(
                status_endpoint,
                headers=headers,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                status_data = response.json()
                
                self.logger.info(f"Payment status retrieved: {merchant_order_id} - {status_data.get('payload', {}).get('state', 'UNKNOWN')}")
                
                return {
                    "success": True,
                    "status_data": status_data,
                    "state": status_data.get('payload', {}).get('state'),
                    "amount": status_data.get('payload', {}).get('amount'),
                    "payment_details": status_data.get('payload', {}).get('paymentDetails', [])
                }
            else:
                error_msg = f"Status check failed: {response.status_code} - {response.text}"
                self.logger.error(error_msg)
                return {
                    "success": False,
                    "error": "Status check failed",
                    "details": response.text
                }
                
        except Exception as e:
            self.logger.error(f"Status check error: {e}")
            return {
                "success": False,
                "error": "Status check failed",
                "details": str(e)
            }
    
    def initiate_refund(self, original_merchant_order_id: str, refund_amount: float, reason: str) -> Dict[str, Any]:
        """Initiate refund using PhonePe API"""
        try:
            # Generate unique refund ID
            timestamp = int(time.time())
            merchant_refund_id = f"REFUND_{original_merchant_order_id}_{timestamp}"
            refund_amount_paisa = int(refund_amount * 100)
            
            access_token = phonepe_auth.get_access_token()
            
            refund_payload = {
                "merchantId": self.merchant_id,
                "merchantRefundId": merchant_refund_id,
                "originalMerchantOrderId": original_merchant_order_id,
                "amount": refund_amount_paisa,
                "reason": reason
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"O-Bearer {access_token}",
                "Accept": "application/json"
            }
            
            self.logger.info(f"Initiating refund: {merchant_refund_id} for ₹{refund_amount}")
            
            response = requests.post(
                self.refund_url,
                json=refund_payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                refund_data = response.json()
                
                self.logger.info(f"Refund initiated successfully: {merchant_refund_id}")
                
                return {
                    "success": True,
                    "merchant_refund_id": merchant_refund_id,
                    "refund_id": refund_data.get("refundId"),
                    "state": refund_data.get("state", "PENDING"),
                    "amount": refund_amount_paisa,
                    "reason": reason
                }
            else:
                error_msg = f"Refund initiation failed: {response.status_code} - {response.text}"
                self.logger.error(error_msg)
                return {
                    "success": False,
                    "error": "Refund initiation failed",
                    "details": response.text
                }
                
        except Exception as e:
            self.logger.error(f"Refund initiation error: {e}")
            return {
                "success": False,
                "error": "Refund initiation failed",
                "details": str(e)
            }
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get service configuration information"""
        return {
            "merchant_id": self.merchant_id,
            "checkout_url": self.checkout_url,
            "status_url": self.status_url,
            "refund_url": self.refund_url,
            "success_url": self.success_url,
            "failure_url": self.failure_url,
            "auth_status": phonepe_auth.get_token_info()
        }

# Global payment service instance
phonepe_payment = PhonePePaymentService()

# Test service on module load
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Testing PhonePe Payment Service...")
    
    # Test credentials
    if phonepe_auth.validate_credentials():
        print("✅ Authentication successful!")
        
        # Test service info
        info = phonepe_payment.get_service_info()
        print(f"Service info: {info}")
        
        # Test payment creation (with small amount)
        print("\nTesting payment creation...")
        result = phonepe_payment.create_payment_order(
            user_id="test_user_123",
            plan_id="pro_plan",
            amount_rupees=1.00,  # ₹1 for testing
            plan_name="Test Plan"
        )
        
        if result["success"]:
            print("✅ Payment order creation successful!")
            print(f"Order ID: {result['merchant_order_id']}")
        else:
            print(f"❌ Payment order creation failed: {result['error']}")
    else:
        print("❌ Authentication failed!")