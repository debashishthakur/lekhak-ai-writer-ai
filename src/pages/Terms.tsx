import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";

const Terms = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="backdrop-blur-sm bg-background/80 rounded-lg p-12 border border-white/10">
          <h1 className="text-4xl font-bold mb-8 text-center font-['Open_Sans']">
            Terms and Conditions
          </h1>
          <div className="prose prose-lg max-w-none text-foreground font-['Open_Sans']">
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Lekhak AI ("the Service"), a Chrome extension and web application provided by Lekhak AI ("Company", "we", "us", or "our"), you accept and agree to be bound by the terms and conditions of this agreement ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Lekhak AI is an AI-powered writing assistant Chrome extension that provides:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Text rewriting and improvement suggestions</li>
              <li>Grammar and spelling corrections</li>
              <li>Tone and style adjustments</li>
              <li>Writing enhancement tools</li>
            </ul>
            <p>
              The Service operates on a freemium model with usage quotas and premium subscription plans.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts and Responsibilities</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Account Creation</h3>
            <p>
              No account creation is required for basic usage. The Service automatically creates a user profile based on your Chrome extension ID to track usage quotas.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">3.2 User Responsibilities</h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
              <li>Not use the Service to create, distribute, or promote harmful, illegal, or offensive content</li>
              <li>Not attempt to reverse engineer, hack, or manipulate the Service</li>
              <li>Not exceed usage quotas through unauthorized means</li>
              <li>Respect intellectual property rights of others when using the Service</li>
              <li>Not use the Service for competitive analysis or to build competing products</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription Plans and Payment Terms</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Subscription Tiers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Free Plan:</strong> 7 uses per day at no cost</li>
              <li><strong>Pro Plan:</strong> ₹399/month for 1,000 uses per month</li>
              <li><strong>Unlimited Plan:</strong> ₹1,599/month for unlimited usage</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 Payment Terms</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>All payments are processed through PhonePe Payment Gateway</li>
              <li>Subscription fees are charged monthly in advance</li>
              <li>All prices include applicable GST (18% on services)</li>
              <li>Payments are non-refundable except as stated in our Refund Policy</li>
              <li>Failed payments may result in service suspension</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.3 Auto-Renewal</h3>
            <p>
              Subscriptions do not auto-renew. Users must manually renew their subscriptions before expiry. We will send renewal reminders via email.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Usage Restrictions</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Prohibited Uses</h3>
            <p>You may not use the Service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Generate harmful, illegal, or inappropriate content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Create spam, malware, or malicious content</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to bypass usage limitations</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Content Guidelines</h3>
            <p>
              Users are responsible for ensuring that all content processed through the Service complies with applicable laws and does not violate the rights of third parties.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property Rights</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Service Ownership</h3>
            <p>
              The Service, including its algorithms, technology, and user interface, is owned by Lekhak AI and is protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 User Content</h3>
            <p>
              You retain ownership of the text you input into the Service. By using the Service, you grant us a limited license to process your content solely for the purpose of providing the Service.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">6.3 Generated Content</h3>
            <p>
              You own the rights to content generated by the Service based on your input, subject to these Terms and applicable laws.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">8.1 Service Availability</h3>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">8.2 Liability Limitations</h3>
            <p>
              To the maximum extent permitted by law, Lekhak AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or downtime</li>
              <li>Content accuracy or quality issues</li>
              <li>Third-party actions or omissions</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">8.3 Maximum Liability</h3>
            <p>
              Our total liability for any claims arising from or related to the Service shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Dispute Resolution</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">9.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">9.2 Jurisdiction</h3>
            <p>
              Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">9.3 Alternative Dispute Resolution</h3>
            <p>
              Before initiating formal legal proceedings, parties agree to attempt resolution through good faith negotiations. If unsuccessful, disputes may be submitted to arbitration under the Arbitration and Conciliation Act, 2015.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Service Modifications and Termination</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">10.1 Service Changes</h3>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice to users.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">10.2 Account Termination</h3>
            <p>
              We may terminate or suspend your access to the Service for violations of these Terms or for any other reason at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Lekhak AI from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Miscellaneous</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">12.1 Entire Agreement</h3>
            <p>
              These Terms constitute the entire agreement between you and Lekhak AI regarding the Service.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">12.3 Updates to Terms</h3>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p><strong>Email:</strong> legal@lekhakai.com</p>
              <p><strong>Website:</strong> www.lekhakai.com</p>
              <p><strong>Contact Person:</strong> Mr. Debashish Thakur</p>
            </div>

            <div className="border-t border-border pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                By using Lekhak AI, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
