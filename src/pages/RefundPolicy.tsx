import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";

const RefundPolicy = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="backdrop-blur-sm bg-background/80 rounded-lg p-12 border border-white/10">
          <h1 className="text-4xl font-bold mb-8 text-center font-['Open_Sans']">
            Refund Policy
          </h1>
          <div className="prose prose-lg max-w-none text-foreground font-['Open_Sans']">
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Refund Eligibility</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">1.1 Eligible for Full Refund</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Pro Plan Subscriptions:</strong> ₹399/month - Full refund within 30 days</li>
              <li><strong>Unlimited Plan Subscriptions:</strong> ₹1599/month - Full refund within 30 days</li>
              <li><strong>Annual Subscriptions:</strong> Prorated refund based on unused period</li>
              <li><strong>Technical Issues:</strong> Service downtime or functionality problems</li>
              <li><strong>Billing Errors:</strong> Incorrect charges or duplicate payments</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Refund Timeframes</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Request Period</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Standard Refund Window:</strong> 30 days from payment date</li>
              <li><strong>Annual Subscriptions:</strong> 30 days from payment for full refund, prorated afterwards</li>
              <li><strong>Technical Issues:</strong> Extended window for service-related problems</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Processing Time</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Refund Approval:</strong> 1-2 business days for review</li>
              <li><strong>PhonePe Refunds:</strong> 5-7 business days to reflect in account</li>
              <li><strong>UPI Refunds:</strong> 1-3 business days</li>
              <li><strong>Card Refunds:</strong> 7-14 business days depending on bank</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How to Request a Refund</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Request Methods</h3>
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="font-medium mb-2 text-foreground">Contact our support team through:</p>
              <ul className="list-disc pl-6 mb-0 text-foreground">
                <li><strong>Website Contact Details:</strong> https://www.lekhakai.com/about</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Required Information</h3>
            <p>Please include the following information in your refund request:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Payment Details:</strong> Transaction ID from PhonePe</li>
              <li><strong>Account Information:</strong> Email address used for subscription</li>
              <li><strong>Purchase Date:</strong> Date of subscription payment</li>
              <li><strong>Reason for Refund:</strong> Brief explanation (optional but helpful)</li>
              <li><strong>Extension ID:</strong> Your Chrome extension identifier (if available)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Refund Process Steps</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-1">1</div>
                <div>
                  <h4 className="font-medium">Submit Request</h4>
                  <p className="text-sm text-muted-foreground">Send refund request with required information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-1">2</div>
                <div>
                  <h4 className="font-medium">Review & Verification</h4>
                  <p className="text-sm text-muted-foreground">We verify payment details and eligibility (1-2 business days)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-1">3</div>
                <div>
                  <h4 className="font-medium">Approval Notification</h4>
                  <p className="text-sm text-muted-foreground">Email confirmation of refund approval</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-1">4</div>
                <div>
                  <h4 className="font-medium">Processing</h4>
                  <p className="text-sm text-muted-foreground">Refund initiated through PhonePe payment gateway</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-1">5</div>
                <div>
                  <h4 className="font-medium">Completion</h4>
                  <p className="text-sm text-muted-foreground">Refund reflects in your account (5-14 business days)</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cancellation Procedures</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Subscription Cancellation</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Manual Renewal System:</strong> Subscriptions do not auto-renew</li>
              <li><strong>Immediate Cancellation:</strong> Simply don't renew your subscription</li>
              <li><strong>Service Access:</strong> Continue using paid features until subscription expires</li>
              <li><strong>Grace Period:</strong> 3-day grace period after expiry for renewal</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 Cancellation vs. Refund</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Cancellation</h4>
                <ul className="text-sm space-y-1">
                  <li>• Stop future payments</li>
                  <li>• Keep current subscription active</li>
                  <li>• No refund for current period</li>
                  <li>• Access until expiry date</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Refund</h4>
                <ul className="text-sm space-y-1">
                  <li>• Get money back</li>
                  <li>• Immediate service termination</li>
                  <li>• Return to free plan</li>
                  <li>• Within 30-day window</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Special Circumstances</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Technical Issues</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Downtime:</strong> Automatic refund/credit for affected periods</li>
              <li><strong>Feature Unavailability:</strong> Prorated refunds for non-functional features</li>
              <li><strong>Chrome Extension Issues:</strong> Extended refund window for technical problems</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Billing Errors</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Duplicate Charges:</strong> Immediate refund of duplicate payments</li>
              <li><strong>Incorrect Amount:</strong> Refund of overcharged amount</li>
              <li><strong>Unauthorized Charges:</strong> Full investigation and refund if confirmed</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Account Issues</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Multiple Accounts:</strong> Consolidation or refund of duplicate subscriptions</li>
              <li><strong>Extension Conflicts:</strong> Technical support or refund if unresolvable</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Payment Gateway Considerations</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">6.1 PhonePe Refund Process</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>UPI Refunds:</strong> 1-3 business days (fastest option)</li>
              <li><strong>Card Refunds:</strong> 7-14 business days depending on issuing bank</li>
              <li><strong>Net Banking:</strong> 5-7 business days</li>
              <li><strong>Wallet Refunds:</strong> 1-2 business days to PhonePe wallet</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Refund Alternatives</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">7.1 Service Credits</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Credit:</strong> Instead of cash refund, credit for future use</li>
              <li><strong>Extended Subscription:</strong> Additional time on current plan</li>
              <li><strong>Plan Upgrade:</strong> Credit towards higher tier subscription</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">7.2 Technical Solutions</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Troubleshooting:</strong> Technical support to resolve issues</li>
              <li><strong>Plan Adjustment:</strong> Switch to more suitable plan</li>
              <li><strong>Extended Trial:</strong> Additional time to evaluate service</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Dispute Resolution</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">8.1 Internal Resolution</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Customer Support:</strong> First point of contact for all refund issues</li>
              <li><strong>Escalation Process:</strong> Manager review for complex cases</li>
              <li><strong>Response Time:</strong> 24-48 hours for initial response</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">8.2 External Resolution</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Consumer Forums:</strong> For unresolved disputes</li>
              <li><strong>Banking Ombudsman:</strong> For payment-related issues</li>
              <li><strong>Chargeback Process:</strong> Through your bank as last resort</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Refund Requests</h4>
                <p><strong>Email:</strong> refunds@lekhakai.com</p>
                <p><strong>Response Time:</strong> 24-48 hours</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">General Support</h4>
                <p><strong>Email:</strong> support@lekhakai.com</p>
                <p><strong>Website:</strong> www.lekhakai.com</p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Policy Updates</h2>
            <p>
              We may update this Refund Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Significant changes will be communicated via email to active subscribers.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Legal Compliance</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>This policy complies with Indian consumer protection laws</li>
              <li>We follow Reserve Bank of India guidelines for digital payments</li>
              <li>All refunds processed according to PhonePe's terms and conditions</li>
              <li>Disputes subject to jurisdiction of Mumbai courts</li>
              <li>If approved,Refund will be credited within 3-14 days to the original payment method. Cancellations should be done within 7 days.</li>
            </ul>

            <div className="border-t border-border pt-6 mt-8">
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-2 text-foreground">Our Commitment</h3>
                <p className="text-sm text-foreground">
                  We stand behind our Service and want you to be completely satisfied. If you're not happy with Lekhak AI for any reason, we'll work with you to make it right, whether that's through technical support, service credits, or a full refund.
                  If approved,Refund will be credited within 3-14 days to the original payment method. Cancellations should be done within 10 days.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Have questions about our refund policy? Contact us at refunds@lekhakai.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
