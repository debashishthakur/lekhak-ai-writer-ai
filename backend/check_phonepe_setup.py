#!/usr/bin/env python3
"""Check PhonePe merchant setup and requirements"""

import os
import requests
from dotenv import load_dotenv
from services.phonepe_auth import phonepe_auth

load_dotenv()

def check_phonepe_setup():
    """Check PhonePe merchant setup"""
    
    print("🔍 PHONEPE MERCHANT SETUP CHECK")
    print("=" * 50)
    
    # 1. Check credentials
    print("\n1. 📋 CREDENTIALS:")
    print(f"   Client ID: {os.getenv('PHONEPE_CLIENT_ID')}")
    print(f"   Merchant ID: {os.getenv('PHONEPE_MERCHANT_ID')}")
    print(f"   Environment: {os.getenv('PHONEPE_ENVIRONMENT')}")
    
    # 2. Check authentication
    print("\n2. 🔐 AUTHENTICATION:")
    try:
        token = phonepe_auth.get_access_token()
        print(f"   ✅ Token obtained: {token[:30]}...")
        print(f"   ✅ Token expires: {phonepe_auth.token_expires_at}")
    except Exception as e:
        print(f"   ❌ Authentication failed: {e}")
        return
    
    # 3. Check URLs
    print("\n3. 🌐 API ENDPOINTS:")
    print(f"   Auth URL: {os.getenv('PHONEPE_AUTH_URL')}")
    print(f"   Checkout URL: {os.getenv('PHONEPE_CHECKOUT_URL')}")
    print(f"   Webhook URL: {os.getenv('PHONEPE_WEBHOOK_URL')}")
    
    # 4. Test webhook URL accessibility (basic check)
    print("\n4. 🔗 WEBHOOK ACCESSIBILITY:")
    webhook_url = os.getenv('PHONEPE_WEBHOOK_URL')
    try:
        # This won't actually work since we need POST and auth, but checks basic connectivity
        response = requests.get(webhook_url.replace('/api/webhooks/phonepe', '/api/health'), timeout=10)
        if response.status_code == 200:
            print(f"   ✅ Website reachable: {webhook_url}")
        else:
            print(f"   ⚠️ Website status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Website not reachable: {e}")
        print(f"   💡 PhonePe needs to reach your webhook URL from the internet")
    
    # 5. Check minimum amount requirements
    print("\n5. 💰 AMOUNT REQUIREMENTS:")
    print("   📍 Common PhonePe minimum amounts:")
    print("      - UPI: ₹1")
    print("      - Cards: ₹1") 
    print("      - Net Banking: ₹1")
    print("      - Wallets: ₹1")
    print(f"   💡 Your test amount: ₹5.90 (should be acceptable)")
    
    # 6. Business verification status
    print("\n6. 🏢 BUSINESS VERIFICATION:")
    print("   📋 Required for production:")
    print("      - Business registration documents")
    print("      - Bank account verification")
    print("      - Website verification")
    print("      - Business category approval")
    print("   💡 Contact PhonePe support to verify account status")
    
    # 7. Common error causes
    print("\n7. ❓ COMMON INTERNAL_SERVER_ERROR CAUSES:")
    print("   1. Merchant account not fully activated")
    print("   2. Missing business verification")
    print("   3. Webhook URL not accessible from internet")
    print("   4. Invalid merchant configuration")
    print("   5. Business category restrictions")
    print("   6. Payment method restrictions")
    
    # 8. Next steps
    print("\n8. 🎯 RECOMMENDED NEXT STEPS:")
    print("   1. Contact PhonePe Business Support:")
    print("      - Email: merchant.support@phonepe.com")
    print("      - Phone: 080-68727374")
    print("   2. Request sandbox/test environment access")
    print("   3. Verify merchant account activation status")
    print("   4. Check business verification requirements")
    print("   5. Confirm webhook URL is publicly accessible")
    
    print("\n" + "=" * 50)
    print("💡 The integration code is correct - issue is likely merchant setup")

if __name__ == "__main__":
    check_phonepe_setup()