import os
import time
import requests
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class PhonePeAuthService:
    """Production PhonePe OAuth Token Management Service"""
    
    def __init__(self):
        self.client_id = os.getenv('PHONEPE_CLIENT_ID')
        self.client_secret = os.getenv('PHONEPE_CLIENT_SECRET')
        self.client_version = os.getenv('PHONEPE_CLIENT_VERSION', '1')
        self.auth_url = os.getenv('PHONEPE_AUTH_URL')
        
        self.access_token = None
        self.token_expires_at = None
        self.logger = logging.getLogger(__name__)
        
        # Validate required credentials
        if not all([self.client_id, self.client_secret, self.auth_url]):
            raise ValueError("Missing required PhonePe credentials")
    
    def get_access_token(self) -> str:
        """Get valid access token, refresh if needed"""
        if self.is_token_expired():
            self._refresh_token()
        
        return self.access_token
    
    def is_token_expired(self) -> bool:
        """Check if current token is expired or about to expire"""
        if not self.access_token or not self.token_expires_at:
            return True
        
        # Refresh token 5 minutes before expiry
        buffer_time = timedelta(minutes=5)
        return datetime.now() >= (self.token_expires_at - buffer_time)
    
    def _refresh_token(self) -> None:
        """Refresh OAuth access token"""
        try:
            payload = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "client_version": self.client_version,
                "grant_type": "client_credentials"
            }
            
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
            
            self.logger.info("Refreshing PhonePe access token...")
            
            response = requests.post(
                self.auth_url,
                data=payload,  # Use data instead of json for form encoding
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get('access_token')
                expires_at = token_data.get('expires_at')
                
                if not self.access_token:
                    raise Exception("No access token in response")
                
                # Convert epoch timestamp to datetime
                if expires_at:
                    self.token_expires_at = datetime.fromtimestamp(expires_at)
                else:
                    # Default 1 hour if no expiry provided
                    self.token_expires_at = datetime.now() + timedelta(hours=1)
                
                self.logger.info(f"PhonePe access token refreshed successfully. Expires at: {self.token_expires_at}")
            else:
                error_msg = f"Token refresh failed: {response.status_code} - {response.text}"
                self.logger.error(error_msg)
                raise Exception(error_msg)
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Network error during token refresh: {e}")
            raise Exception(f"Network error: {e}")
        except Exception as e:
            self.logger.error(f"Token refresh error: {e}")
            raise Exception(f"Token refresh failed: {e}")
    
    def validate_credentials(self) -> bool:
        """Validate PhonePe credentials by attempting token refresh"""
        try:
            self._refresh_token()
            return True
        except Exception as e:
            self.logger.error(f"Credential validation failed: {e}")
            return False
    
    def get_token_info(self) -> Dict:
        """Get current token information"""
        return {
            "has_token": bool(self.access_token),
            "expires_at": self.token_expires_at.isoformat() if self.token_expires_at else None,
            "is_expired": self.is_token_expired(),
            "client_id": self.client_id[:8] + "..." if self.client_id else None
        }

# Global auth service instance
phonepe_auth = PhonePeAuthService()

# Test credentials on module load
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Testing PhonePe credentials...")
    
    if phonepe_auth.validate_credentials():
        print("✅ PhonePe credentials are valid!")
        print(f"Token info: {phonepe_auth.get_token_info()}")
    else:
        print("❌ PhonePe credentials validation failed!")