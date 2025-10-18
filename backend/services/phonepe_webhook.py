import os
import json
import hashlib
import hmac
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import Request, HTTPException
from dotenv import load_dotenv

load_dotenv()

class PhonePeWebhookHandler:
    """Production PhonePe Webhook Handler for all selected events"""
    
    def __init__(self):
        self.webhook_username = os.getenv('PHONEPE_WEBHOOK_USERNAME')
        self.webhook_password = os.getenv('PHONEPE_WEBHOOK_PASSWORD')
        self.logger = logging.getLogger(__name__)
        
        # Event handler mapping
        self.event_handlers = {
            # Primary payment events
            'checkout.order.completed': self.handle_payment_success,
            'checkout.order.failed': self.handle_payment_failure,
            
            # Backup payment events
            'pg.order.completed': self.handle_payment_success,
            'pg.order.failed': self.handle_payment_failure,
            
            # Refund events
            'pg.refund.completed': self.handle_refund_success,
            'pg.refund.failed': self.handle_refund_failure,
            'pg.refund.accepted': self.handle_refund_accepted,
            
            # Settlement events
            'settlement.initiated': self.handle_settlement_started,
            'settlement.attempt.failed': self.handle_settlement_failure,
            
            # Subscription events (future use)
            'subscription.paused': self.handle_subscription_paused,
            'subscription.cancelled': self.handle_subscription_cancelled,
            'subscription.revoked': self.handle_subscription_revoked,
            
            # Dispute events
            'payment.dispute.created': self.handle_dispute_created,
            'payment.dispute.under_review': self.handle_dispute_review,
            
            # Paylink events
            'paylink.order.completed': self.handle_paylink_success,
            'paylink.order.failed': self.handle_paylink_failure,
        }
        
        if not all([self.webhook_username, self.webhook_password]):
            raise ValueError("Missing webhook authentication credentials")
    
    async def process_webhook(self, request: Request) -> Dict[str, Any]:
        """Process PhonePe webhook with enhanced security"""
        try:
            # Get webhook data
            authorization_header = request.headers.get('Authorization', '')
            webhook_body = await request.body()
            
            # Parse webhook data
            try:
                webhook_data = json.loads(webhook_body.decode('utf-8'))
            except json.JSONDecodeError as e:
                self.logger.error(f"Invalid JSON in webhook: {e}")
                raise HTTPException(status_code=400, detail="Invalid JSON payload")
            
            # Verify webhook authenticity
            if not self._verify_webhook_signature(authorization_header, webhook_body):
                self.logger.error("Webhook signature verification failed")
                raise HTTPException(status_code=401, detail="Invalid webhook signature")
            
            # Extract event information
            event_type = webhook_data.get('event')
            payload = webhook_data.get('payload', {})
            timestamp = webhook_data.get('timestamp', int(datetime.now().timestamp()))
            
            self.logger.info(f"Processing webhook event: {event_type}")
            
            # Process event
            if event_type in self.event_handlers:
                await self.event_handlers[event_type](payload, webhook_data)
                self.logger.info(f"Successfully processed webhook event: {event_type}")
            else:
                self.logger.warning(f"Unknown webhook event type: {event_type}")
                # Still return success to avoid retries
            
            return {
                "status": "success", 
                "message": "Webhook processed",
                "event": event_type,
                "timestamp": timestamp
            }
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error(f"Webhook processing error: {e}")
            raise HTTPException(status_code=500, detail="Webhook processing failed")
    
    def _verify_webhook_signature(self, auth_header: str, webhook_body: bytes) -> bool:
        """Verify webhook signature using SHA256"""
        try:
            # Extract signature from header
            if not auth_header.startswith('SHA256'):
                self.logger.warning("Authorization header does not start with SHA256")
                return False
            
            received_signature = auth_header.split(' ', 1)[1] if ' ' in auth_header else auth_header[6:]
            
            # Calculate expected signature
            message = webhook_body + self.webhook_password.encode('utf-8')
            expected_signature = hashlib.sha256(message).hexdigest()
            
            # Compare signatures
            is_valid = hmac.compare_digest(received_signature.lower(), expected_signature.lower())
            
            if not is_valid:
                self.logger.warning(f"Signature mismatch. Received: {received_signature[:10]}..., Expected: {expected_signature[:10]}...")
            
            return is_valid
            
        except Exception as e:
            self.logger.error(f"Signature verification error: {e}")
            return False
    
    # Payment Event Handlers
    async def handle_payment_success(self, payload: Dict, webhook_data: Dict):
        """Handle successful payment events"""
        merchant_order_id = payload.get('merchantOrderId')
        payment_state = payload.get('state')
        amount = payload.get('amount')
        payment_method = payload.get('paymentDetails', [{}])[0].get('paymentMode', 'UNKNOWN')
        
        self.logger.info(f"Payment successful: {merchant_order_id}, Amount: {amount}, Method: {payment_method}")
        
        if payment_state == 'COMPLETED':
            # Activate subscription
            await self._activate_subscription(merchant_order_id, payload)
            
            # Log payment success
            await self._log_payment_event(merchant_order_id, 'SUCCESS', payload)
    
    async def handle_payment_failure(self, payload: Dict, webhook_data: Dict):
        """Handle failed payment events"""
        merchant_order_id = payload.get('merchantOrderId')
        error_code = payload.get('errorCode')
        error_message = payload.get('errorMessage', 'Payment failed')
        
        self.logger.warning(f"Payment failed: {merchant_order_id}, Error: {error_code} - {error_message}")
        
        # Update payment status
        await self._update_payment_failure(merchant_order_id, payload)
        
        # Log payment failure
        await self._log_payment_event(merchant_order_id, 'FAILED', payload)
    
    # Refund Event Handlers
    async def handle_refund_success(self, payload: Dict, webhook_data: Dict):
        """Handle successful refund events"""
        refund_id = payload.get('refundId')
        merchant_refund_id = payload.get('merchantRefundId')
        amount = payload.get('amount')
        
        self.logger.info(f"Refund successful: {refund_id}, Amount: {amount}")
        
        # Process refund completion
        await self._complete_refund(merchant_refund_id, payload)
        
        # Deactivate/downgrade subscription if needed
        await self._handle_refund_subscription_impact(merchant_refund_id, payload)
    
    async def handle_refund_failure(self, payload: Dict, webhook_data: Dict):
        """Handle failed refund events"""
        merchant_refund_id = payload.get('merchantRefundId')
        error_code = payload.get('errorCode')
        
        self.logger.warning(f"Refund failed: {merchant_refund_id}, Error: {error_code}")
        
        # Update refund failure status
        await self._update_refund_failure(merchant_refund_id, payload)
    
    async def handle_refund_accepted(self, payload: Dict, webhook_data: Dict):
        """Handle refund accepted events"""
        merchant_refund_id = payload.get('merchantRefundId')
        
        self.logger.info(f"Refund accepted: {merchant_refund_id}")
        
        # Update refund status to accepted
        await self._update_refund_status(merchant_refund_id, 'ACCEPTED', payload)
    
    # Settlement Event Handlers
    async def handle_settlement_started(self, payload: Dict, webhook_data: Dict):
        """Handle settlement initiated events"""
        settlement_id = payload.get('settlementId')
        amount = payload.get('amount')
        
        self.logger.info(f"Settlement initiated: {settlement_id}, Amount: {amount}")
        
        # Log settlement for financial tracking
        await self._log_settlement_event(settlement_id, 'INITIATED', payload)
    
    async def handle_settlement_failure(self, payload: Dict, webhook_data: Dict):
        """Handle settlement failure events"""
        settlement_id = payload.get('settlementId')
        error_code = payload.get('errorCode')
        
        self.logger.warning(f"Settlement failed: {settlement_id}, Error: {error_code}")
        
        # Log settlement failure for follow-up
        await self._log_settlement_event(settlement_id, 'FAILED', payload)
    
    # Subscription Event Handlers (Future Use)
    async def handle_subscription_paused(self, payload: Dict, webhook_data: Dict):
        """Handle subscription paused events"""
        subscription_id = payload.get('subscriptionId')
        
        self.logger.info(f"Subscription paused: {subscription_id}")
        
        # Update subscription status
        await self._update_subscription_status(subscription_id, 'PAUSED', payload)
    
    async def handle_subscription_cancelled(self, payload: Dict, webhook_data: Dict):
        """Handle subscription cancelled events"""
        subscription_id = payload.get('subscriptionId')
        
        self.logger.info(f"Subscription cancelled: {subscription_id}")
        
        # Update subscription status
        await self._update_subscription_status(subscription_id, 'CANCELLED', payload)
    
    async def handle_subscription_revoked(self, payload: Dict, webhook_data: Dict):
        """Handle subscription revoked events"""
        subscription_id = payload.get('subscriptionId')
        
        self.logger.warning(f"Subscription revoked: {subscription_id}")
        
        # Update subscription status
        await self._update_subscription_status(subscription_id, 'REVOKED', payload)
    
    # Dispute Event Handlers
    async def handle_dispute_created(self, payload: Dict, webhook_data: Dict):
        """Handle payment dispute created events"""
        dispute_id = payload.get('disputeId')
        merchant_order_id = payload.get('merchantOrderId')
        
        self.logger.warning(f"Payment dispute created: {dispute_id} for order: {merchant_order_id}")
        
        # Log dispute for manual review
        await self._log_dispute_event(dispute_id, 'CREATED', payload)
        
        # Notify admin/support team
        await self._notify_dispute_created(dispute_id, payload)
    
    async def handle_dispute_review(self, payload: Dict, webhook_data: Dict):
        """Handle payment dispute under review events"""
        dispute_id = payload.get('disputeId')
        
        self.logger.info(f"Payment dispute under review: {dispute_id}")
        
        # Log dispute status update
        await self._log_dispute_event(dispute_id, 'UNDER_REVIEW', payload)
    
    # Paylink Event Handlers
    async def handle_paylink_success(self, payload: Dict, webhook_data: Dict):
        """Handle paylink success events"""
        paylink_id = payload.get('paylinkId')
        merchant_order_id = payload.get('merchantOrderId')
        
        self.logger.info(f"Paylink payment successful: {paylink_id}")
        
        # Process like regular payment
        await self.handle_payment_success(payload, webhook_data)
    
    async def handle_paylink_failure(self, payload: Dict, webhook_data: Dict):
        """Handle paylink failure events"""
        paylink_id = payload.get('paylinkId')
        
        self.logger.warning(f"Paylink payment failed: {paylink_id}")
        
        # Process like regular payment failure
        await self.handle_payment_failure(payload, webhook_data)
    
    # Database Operations (To be implemented with actual database)
    async def _activate_subscription(self, merchant_order_id: str, payload: Dict):
        """Activate user subscription after successful payment"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Activate subscription for order: {merchant_order_id}")
        pass
    
    async def _update_payment_failure(self, merchant_order_id: str, payload: Dict):
        """Update payment failure status"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Update payment failure for order: {merchant_order_id}")
        pass
    
    async def _log_payment_event(self, merchant_order_id: str, status: str, payload: Dict):
        """Log payment event for audit trail"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Log payment event: {merchant_order_id} - {status}")
        pass
    
    async def _complete_refund(self, merchant_refund_id: str, payload: Dict):
        """Complete refund processing"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Complete refund: {merchant_refund_id}")
        pass
    
    async def _update_refund_failure(self, merchant_refund_id: str, payload: Dict):
        """Update refund failure status"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Update refund failure: {merchant_refund_id}")
        pass
    
    async def _update_refund_status(self, merchant_refund_id: str, status: str, payload: Dict):
        """Update refund status"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Update refund status: {merchant_refund_id} - {status}")
        pass
    
    async def _handle_refund_subscription_impact(self, merchant_refund_id: str, payload: Dict):
        """Handle subscription impact of refund"""
        # TODO: Implement subscription downgrade/cancellation logic
        self.logger.info(f"TODO: Handle subscription impact for refund: {merchant_refund_id}")
        pass
    
    async def _log_settlement_event(self, settlement_id: str, status: str, payload: Dict):
        """Log settlement event"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Log settlement event: {settlement_id} - {status}")
        pass
    
    async def _update_subscription_status(self, subscription_id: str, status: str, payload: Dict):
        """Update subscription status"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Update subscription status: {subscription_id} - {status}")
        pass
    
    async def _log_dispute_event(self, dispute_id: str, status: str, payload: Dict):
        """Log dispute event"""
        # TODO: Implement database operations
        self.logger.info(f"TODO: Log dispute event: {dispute_id} - {status}")
        pass
    
    async def _notify_dispute_created(self, dispute_id: str, payload: Dict):
        """Notify admin team about dispute"""
        # TODO: Implement notification system
        self.logger.info(f"TODO: Notify dispute created: {dispute_id}")
        pass

# Global webhook handler instance
webhook_handler = PhonePeWebhookHandler()

# Test webhook handler
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Testing PhonePe Webhook Handler...")
    
    # Test signature verification
    test_body = b'{"test": "webhook"}'
    test_password = "may211999"
    
    # Create test signature
    message = test_body + test_password.encode('utf-8')
    test_signature = hashlib.sha256(message).hexdigest()
    test_auth_header = f"SHA256 {test_signature}"
    
    # Test verification
    handler = PhonePeWebhookHandler()
    is_valid = handler._verify_webhook_signature(test_auth_header, test_body)
    
    print(f"✅ Signature verification test: {'PASSED' if is_valid else 'FAILED'}")
    print(f"Supported events: {len(handler.event_handlers)}")
    
    for event in handler.event_handlers.keys():
        print(f"  - {event}")