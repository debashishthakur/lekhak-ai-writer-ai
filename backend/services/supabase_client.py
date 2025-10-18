import os
import asyncpg
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
import json
from datetime import datetime

load_dotenv()

class SupabaseService:
    """Supabase database service for Lekhak AI PhonePe integration"""
    
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_anon_key = os.getenv('SUPABASE_ANON_KEY')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        self.logger = logging.getLogger(__name__)
        
        # Initialize Supabase client
        self.supabase: Client = create_client(
            self.supabase_url, 
            self.supabase_service_key  # Use service role for backend operations
        )
        
        # Connection pool for direct PostgreSQL access
        self.connection_pool = None
        
    async def init_connection_pool(self):
        """Initialize asyncpg connection pool"""
        if not self.connection_pool:
            self.connection_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            self.logger.info("Database connection pool initialized")
    
    async def close_connection_pool(self):
        """Close database connection pool"""
        if self.connection_pool:
            await self.connection_pool.close()
            self.logger.info("Database connection pool closed")
    
    # User Management
    async def create_or_get_user(self, extension_id: str, email: str = None, name: str = None) -> Dict[str, Any]:
        """Create or get user by extension ID"""
        try:
            # Check if user exists
            result = self.supabase.table('users').select('*').eq('extension_id', extension_id).execute()
            
            if result.data:
                user = result.data[0]
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
            
            result = self.supabase.table('users').insert(user_data).execute()
            
            if result.data:
                user = result.data[0]
                
                # Create initial quota
                await self.create_user_quota(user['id'])
                
                self.logger.info(f"User created: {user['id']}")
                return {"success": True, "user": user, "created": True}
            else:
                return {"success": False, "error": "Failed to create user"}
                
        except Exception as e:
            self.logger.error(f"Error creating/getting user: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_user_quota(self, user_id: str) -> bool:
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
            
            result = self.supabase.table('user_quotas').insert(quota_data).execute()
            return bool(result.data)
            
        except Exception as e:
            self.logger.error(f"Error creating user quota: {e}")
            return False
    
    # Payment Management
    async def store_payment_order(self, payment_data: Dict[str, Any]) -> bool:
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
            
            result = self.supabase.table('payment_transactions').insert(payment_record).execute()
            
            if result.data:
                # Also store in phonepe_transactions for detailed tracking
                phonepe_record = {
                    "user_id": payment_data["user_id"],
                    "merchant_order_id": payment_data["merchant_order_id"],
                    "amount_paisa": payment_data["amount_paisa"],
                    "state": "PENDING",
                    "expires_at": payment_data.get("expires_at")
                }
                
                self.supabase.table('phonepe_transactions').insert(phonepe_record).execute()
                
                self.logger.info(f"Payment order stored: {payment_data['merchant_order_id']}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error storing payment order: {e}")
            return False
    
    async def update_payment_status(self, merchant_order_id: str, status_data: Dict[str, Any]) -> bool:
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
            
            result = self.supabase.table('payment_transactions').update(update_data).eq(
                'phonepe_merchant_order_id', merchant_order_id
            ).execute()
            
            # Update phonepe_transactions
            phonepe_update = {
                "state": state,
                "payment_details": status_data.get('payload', {}),
                "verified_at": datetime.now().isoformat()
            }
            
            self.supabase.table('phonepe_transactions').update(phonepe_update).eq(
                'merchant_order_id', merchant_order_id
            ).execute()
            
            self.logger.info(f"Payment status updated: {merchant_order_id} - {state}")
            return bool(result.data)
            
        except Exception as e:
            self.logger.error(f"Error updating payment status: {e}")
            return False
    
    async def activate_subscription(self, merchant_order_id: str) -> bool:
        """Activate subscription after successful payment"""
        try:
            # Get payment details
            payment_result = self.supabase.table('payment_transactions').select(
                '*, metadata'
            ).eq('phonepe_merchant_order_id', merchant_order_id).execute()
            
            if not payment_result.data:
                return False
            
            payment = payment_result.data[0]
            user_id = payment['user_id']
            plan_name = payment['metadata'].get('plan_name', 'Pro')
            
            # Get plan details
            plan_result = self.supabase.table('subscription_plans').select('*').eq(
                'name', plan_name
            ).execute()
            
            if not plan_result.data:
                return False
            
            plan = plan_result.data[0]
            
            # Deactivate existing subscriptions
            self.supabase.table('user_subscriptions').update({
                "status": "cancelled",
                "cancelled_at": datetime.now().isoformat()
            }).eq('user_id', user_id).eq('status', 'active').execute()
            
            # Create new subscription
            subscription_data = {
                "user_id": user_id,
                "plan_id": plan['id'],
                "status": "active",
                "billing_cycle": "monthly",
                "phonepe_merchant_order_id": merchant_order_id,
                "started_at": datetime.now().isoformat(),
                "current_period_start": datetime.now().isoformat(),
                "current_period_end": (datetime.now().replace(day=1) + 
                                     datetime.timedelta(days=32)).replace(day=1).isoformat()
            }
            
            subscription_result = self.supabase.table('user_subscriptions').insert(
                subscription_data
            ).execute()
            
            if subscription_result.data:
                # Update user quota limits
                quota_update = {
                    "daily_limit": 7 if plan['name'] == 'Free' else plan['hits_limit'],
                    "monthly_limit": plan['hits_limit'],
                    "hits_used_this_month": 0,  # Reset for new subscription
                    "updated_at": datetime.now().isoformat()
                }
                
                self.supabase.table('user_quotas').update(quota_update).eq(
                    'user_id', user_id
                ).execute()
                
                self.logger.info(f"Subscription activated for user: {user_id}, plan: {plan_name}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error activating subscription: {e}")
            return False
    
    # Webhook Event Logging
    async def log_webhook_event(self, event_type: str, payload: Dict[str, Any]) -> bool:
        """Log webhook event"""
        try:
            webhook_data = {
                "event_type": event_type,
                "merchant_order_id": payload.get('merchantOrderId'),
                "phonepe_order_id": payload.get('orderId'),
                "payload": payload,
                "processed": False,
                "created_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table('webhook_events').insert(webhook_data).execute()
            return bool(result.data)
            
        except Exception as e:
            self.logger.error(f"Error logging webhook event: {e}")
            return False
    
    async def mark_webhook_processed(self, webhook_id: str) -> bool:
        """Mark webhook as processed"""
        try:
            result = self.supabase.table('webhook_events').update({
                "processed": True,
                "processed_at": datetime.now().isoformat()
            }).eq('id', webhook_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            self.logger.error(f"Error marking webhook processed: {e}")
            return False
    
    # User Quota Management
    async def check_user_quota(self, user_id: str) -> Dict[str, Any]:
        """Check user quota and limits"""
        try:
            # Get user quota
            quota_result = self.supabase.table('user_quotas').select('*').eq(
                'user_id', user_id
            ).execute()
            
            if not quota_result.data:
                return {"can_use": False, "error": "No quota found"}
            
            quota = quota_result.data[0]
            
            # Get active subscription
            subscription_result = self.supabase.table('user_subscriptions').select(
                '*, subscription_plans(*)'
            ).eq('user_id', user_id).eq('status', 'active').execute()
            
            if subscription_result.data:
                subscription = subscription_result.data[0]
                plan = subscription['subscription_plans']
                
                if plan['name'] == 'Unlimited':
                    return {
                        "can_use": True,
                        "hits_remaining": -1,
                        "subscription_status": "unlimited",
                        "plan_name": plan['name']
                    }
                elif plan['name'] == 'Pro':
                    remaining = max(0, 1000 - quota['hits_used_this_month'])
                    return {
                        "can_use": remaining > 0,
                        "hits_remaining": remaining,
                        "subscription_status": "pro",
                        "plan_name": plan['name']
                    }
            
            # Free plan
            remaining = max(0, 7 - quota['hits_used_today'])
            return {
                "can_use": remaining > 0,
                "hits_remaining": remaining,
                "subscription_status": "free",
                "plan_name": "Free"
            }
            
        except Exception as e:
            self.logger.error(f"Error checking user quota: {e}")
            return {"can_use": False, "error": str(e)}
    
    async def increment_usage(self, user_id: str) -> bool:
        """Increment user usage count"""
        try:
            # This will be handled by database triggers
            # For now, we'll just log the usage
            usage_data = {
                "user_id": user_id,
                "action_type": "text_rewrite",
                "created_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table('usage_logs').insert(usage_data).execute()
            return bool(result.data)
            
        except Exception as e:
            self.logger.error(f"Error incrementing usage: {e}")
            return False
    
    async def get_payment_by_order_id(self, merchant_order_id: str) -> Optional[Dict[str, Any]]:
        """Get payment by merchant order ID"""
        try:
            result = self.supabase.table('payment_transactions').select('*').eq(
                'phonepe_merchant_order_id', merchant_order_id
            ).execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            self.logger.error(f"Error getting payment: {e}")
            return None

# Global Supabase service instance
supabase_service = SupabaseService()

# Test connection
if __name__ == "__main__":
    import asyncio
    
    async def test_supabase():
        logging.basicConfig(level=logging.INFO)
        print("Testing Supabase connection...")
        
        try:
            # Test basic connection
            result = supabase_service.supabase.table('subscription_plans').select('name, price_monthly').execute()
            print(f"✅ Supabase connection successful!")
            print(f"Available plans: {[plan['name'] for plan in result.data]}")
            
            # Test user creation
            test_result = await supabase_service.create_or_get_user(
                extension_id="test_extension_123",
                email="test@example.com",
                name="Test User"
            )
            
            if test_result["success"]:
                print(f"✅ User operations working!")
                print(f"User: {test_result['user']['id']}")
            else:
                print(f"❌ User operations failed: {test_result['error']}")
                
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
    
    asyncio.run(test_supabase())