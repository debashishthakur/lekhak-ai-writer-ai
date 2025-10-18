#!/usr/bin/env python3
"""Supabase REST API client for PhonePe integration"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

class SupabaseRestService:
    """Supabase REST API service for Lekhak AI PhonePe integration"""
    
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        self.logger = logging.getLogger(__name__)
        
        if not all([self.supabase_url, self.supabase_anon_key, self.supabase_service_key]):
            raise ValueError("Missing Supabase environment variables")
        
        # Use service role for backend operations
        self.headers = {
            "apikey": self.supabase_service_key,
            "Authorization": f"Bearer {self.supabase_service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Optional[Dict]:
        """Make HTTP request to Supabase REST API"""
        try:
            url = f"{self.supabase_url}/rest/v1/{endpoint}"
            
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data if data else None,
                params=params if params else None,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                self.logger.error(f"Supabase API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Supabase request error: {e}")
            return None
    
    # User Management
    def create_or_get_user(self, extension_id: str, email: str = None, name: str = None) -> Dict[str, Any]:
        """Create or get user by extension ID"""
        try:
            # Check if user exists
            users = self._make_request("GET", "users", params={"extension_id": f"eq.{extension_id}"})
            
            if users and len(users) > 0:
                user = users[0]
                self.logger.info(f"User found: {user['id']}")
                return {"success": True, "user": user, "created": False}
            
            # Create new user
            user_data = {
                "extension_id": extension_id,
                "email": email,
                "name": name,
                "is_active": True,
                "created_at": datetime.now().isoformat(),
                "last_seen": datetime.now().isoformat()
            }
            
            result = self._make_request("POST", "users", data=user_data)
            
            if result and len(result) > 0:
                user = result[0]
                
                # Create initial quota
                self.create_user_quota(user['id'])
                
                self.logger.info(f"User created: {user['id']}")
                return {"success": True, "user": user, "created": True}
            else:
                return {"success": False, "error": "Failed to create user"}
                
        except Exception as e:
            self.logger.error(f"Error creating/getting user: {e}")
            return {"success": False, "error": str(e)}
    
    def create_user_quota(self, user_id: str) -> bool:
        """Create initial quota for user"""
        try:
            quota_data = {
                "user_id": user_id,
                "hits_used_today": 0,
                "hits_used_this_month": 0,
                "total_hits_used": 0,
                "daily_limit": 7,  # Free plan default
                "monthly_limit": -1
            }
            
            result = self._make_request("POST", "user_quotas", data=quota_data)
            return result is not None
            
        except Exception as e:
            self.logger.error(f"Error creating user quota: {e}")
            return False
    
    # Payment Management
    def store_payment_order(self, payment_data: Dict[str, Any]) -> bool:
        """Store payment order in database"""
        try:
            # Store in payment_transactions table
            payment_record = {
                "user_id": payment_data["user_id"],
                "phonepe_merchant_order_id": payment_data["merchant_order_id"],
                "amount_paisa": payment_data["amount_paisa"],
                "amount_rupees": payment_data["amount_rupees"],
                "base_amount": payment_data["base_amount"],
                "gst_amount": payment_data["gst_amount"],
                "status": "pending",
                "metadata": {
                    "plan_id": payment_data["plan_id"],
                    "plan_name": payment_data["plan_name"]
                }
            }
            
            result = self._make_request("POST", "payment_transactions", data=payment_record)
            
            if result:
                # Also store in phonepe_transactions for detailed tracking
                phonepe_record = {
                    "user_id": payment_data["user_id"],
                    "merchant_order_id": payment_data["merchant_order_id"],
                    "amount_paisa": payment_data["amount_paisa"],
                    "state": "PENDING",
                    "expires_at": payment_data.get("expires_at")
                }
                
                self._make_request("POST", "phonepe_transactions", data=phonepe_record)
                
                self.logger.info(f"Payment order stored: {payment_data['merchant_order_id']}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error storing payment order: {e}")
            return False
    
    def update_payment_status(self, merchant_order_id: str, status_data: Dict[str, Any]) -> bool:
        """Update payment status"""
        try:
            state = status_data.get('payload', {}).get('state')
            payment_details = status_data.get('payload', {}).get('paymentDetails', [])
            
            # Update payment_transactions
            update_data = {
                "phonepe_state": state,
                "phonepe_payment_details": payment_details,
                "updated_at": datetime.now().isoformat()
            }
            
            if state == 'COMPLETED':
                update_data["status"] = "completed"
                update_data["completed_at"] = datetime.now().isoformat()
            elif state == 'FAILED':
                update_data["status"] = "failed"
                update_data["failed_at"] = datetime.now().isoformat()
            
            result = self._make_request(
                "PATCH", 
                f"payment_transactions?phonepe_merchant_order_id=eq.{merchant_order_id}",
                data=update_data
            )
            
            # Update phonepe_transactions
            phonepe_update = {
                "state": state,
                "payment_details": status_data.get('payload', {}),
                "verified_at": datetime.now().isoformat()
            }
            
            self._make_request(
                "PATCH",
                f"phonepe_transactions?merchant_order_id=eq.{merchant_order_id}",
                data=phonepe_update
            )
            
            self.logger.info(f"Payment status updated: {merchant_order_id} - {state}")
            return result is not None
            
        except Exception as e:
            self.logger.error(f"Error updating payment status: {e}")
            return False
    
    def get_payment_by_order_id(self, merchant_order_id: str) -> Optional[Dict[str, Any]]:
        """Get payment by merchant order ID"""
        try:
            payments = self._make_request(
                "GET", 
                "payment_transactions", 
                params={"phonepe_merchant_order_id": f"eq.{merchant_order_id}"}
            )
            
            return payments[0] if payments and len(payments) > 0 else None
            
        except Exception as e:
            self.logger.error(f"Error getting payment: {e}")
            return None
    
    def get_subscription_plans(self) -> List[Dict[str, Any]]:
        """Get all subscription plans"""
        try:
            plans = self._make_request("GET", "subscription_plans", params={"is_active": "eq.true"})
            return plans or []
        except Exception as e:
            self.logger.error(f"Error getting subscription plans: {e}")
            return []

# Global Supabase service instance
supabase_service = SupabaseRestService()

# Test connection
if __name__ == "__main__":
    import logging
    
    logging.basicConfig(level=logging.INFO)
    print("Testing Supabase REST API connection...")
    
    try:
        # Test basic connection
        plans = supabase_service.get_subscription_plans()
        print(f"✅ Supabase REST API connection successful!")
        print(f"Available plans: {[plan['name'] for plan in plans]}")
        
        # Test user creation
        test_result = supabase_service.create_or_get_user(
            extension_id="test_extension_rest_123",
            email="test@example.com",
            name="Test User REST"
        )
        
        if test_result["success"]:
            print(f"✅ User operations working!")
            print(f"User: {test_result['user']['id']}")
        else:
            print(f"❌ User operations failed: {test_result['error']}")
            
    except Exception as e:
        print(f"❌ Supabase REST API connection failed: {e}")