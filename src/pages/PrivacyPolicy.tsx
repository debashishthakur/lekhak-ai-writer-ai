import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";

const PrivacyPolicy = () => {
  return (
    <div className="gradient-animate min-h-screen relative">
      <StarField />
      <Navigation />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="backdrop-blur-sm bg-background/80 rounded-lg p-12 border border-white/10">
          <h1 className="text-4xl font-bold mb-8 text-center font-['Open_Sans']">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none text-foreground font-['Open_Sans']">
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Lekhak AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our AI-powered writing assistant Chrome extension and related services ("Service").
            </p>
            <p>
              <strong>Privacy-First Approach:</strong> We are proud to operate on a privacy-first model. We do not require account creation for basic usage and collect only the minimal data necessary to provide our Service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Extension ID:</strong> Your Chrome extension's unique identifier (used for usage tracking and quota management)</li>
              <li><strong>Usage Data:</strong> Number of uses, feature interactions, and usage timestamps</li>
              <li><strong>Technical Data:</strong> Browser type, extension version, and basic system information</li>
              <li><strong>IP Address:</strong> For security and fraud prevention (automatically anonymized after 30 days)</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Content Data</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Input Text:</strong> Text you submit for processing (temporarily processed, not permanently stored)</li>
              <li><strong>Processing Metadata:</strong> Text length, processing time, and result quality metrics</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Optional Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Email Address:</strong> Only if you join our waitlist or subscribe to premium plans</li>
              <li><strong>Payment Information:</strong> Processed securely through PhonePe (we do not store payment details)</li>
              <li><strong>Support Communications:</strong> Information you provide when contacting customer support</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.4 Information We Do NOT Collect</h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <ul className="list-disc pl-6 mb-0">
                <li>Personal names, addresses, or phone numbers (unless voluntarily provided)</li>
                <li>Browsing history or website content outside our Service</li>
                <li>Passwords or sensitive authentication data</li>
                <li>Social media profiles or third-party account information</li>
                <li>Location data or GPS coordinates</li>
                <li>Device identifiers beyond what's necessary for Service functionality</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Service Provision</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Process your text for AI-powered writing assistance</li>
              <li>Track usage quotas and enforce plan limitations</li>
              <li>Provide customer support and technical assistance</li>
              <li>Improve Service performance and user experience</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Business Operations</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related notifications and updates</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Service Improvement</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Analyze usage patterns to improve AI models (anonymized data only)</li>
              <li>Monitor Service performance and reliability</li>
              <li>Develop new features and capabilities</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Data Storage</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Database:</strong> User data stored securely on Supabase with encryption at rest</li>
              <li><strong>Text Processing:</strong> Input text is processed in real-time and not permanently stored</li>
              <li><strong>Backup Systems:</strong> Regular encrypted backups for data integrity</li>
              <li><strong>Geographic Location:</strong> Data stored in secure data centers with appropriate safeguards</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 Security Measures</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Encryption:</strong> All data transmission uses HTTPS/TLS encryption</li>
              <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
              <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              <li><strong>Data Minimization:</strong> We collect and retain only necessary information</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.3 Data Retention</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Data:</strong> Retained for 2 years for analytics and service improvement</li>
              <li><strong>Payment Records:</strong> Retained for 7 years as required by law</li>
              <li><strong>Support Communications:</strong> Retained for 3 years</li>
              <li><strong>Input Text:</strong> Not stored permanently; processed and discarded immediately</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Information Sharing and Disclosure</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">5.1 We Do NOT Share Your Data</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-medium mb-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Limited Sharing Scenarios</h3>
            <p>We may share information only in the following limited circumstances:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Service Providers:</strong> Trusted vendors who help operate our Service (under strict data protection agreements)</li>
              <li><strong>Payment Processing:</strong> PhonePe for payment transactions (they have their own privacy policy)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfer:</strong> In case of merger or acquisition (with user notification)</li>
              <li><strong>Safety and Security:</strong> To protect against fraud, abuse, or security threats</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">5.3 Third-Party Services</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>PhonePe:</strong> Payment processing (subject to PhonePe's privacy policy)</li>
              <li><strong>Supabase:</strong> Database hosting (subject to Supabase's privacy policy)</li>
              <li><strong>Vercel:</strong> Web hosting (subject to Vercel's privacy policy)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">6.1 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Essential Cookies:</strong> Required for Service functionality (extension ID tracking, session management)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns (anonymized data)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">6.2 Cookie Management</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Essential cookies cannot be disabled as they're required for Service operation</li>
              <li>You can control analytics and preference cookies through your browser settings</li>
              <li>Disabling cookies may impact Service functionality</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">6.3 Third-Party Tracking</h3>
            <p>
              We do not use third-party advertising networks or tracking systems. We believe in respecting your privacy and do not monetize your data.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Privacy Rights</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">7.1 Access and Control</h3>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access:</strong> Request information about data we have collected about you</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">7.2 Exercising Your Rights</h3>
            <p>
              To exercise these rights, contact us at <strong>privacy@lekhakai.com</strong>. We will respond within 30 days and may require identity verification.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">7.3 Data Subject Rights (Indian Users)</h3>
            <p>
              Under Indian data protection laws, you have additional rights including the right to grievance redressal and complaints to data protection authorities.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. International Data Transfers</h2>
            <p>
              Our Service primarily operates within India. If data is transferred internationally, we ensure appropriate safeguards are in place including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Adequacy decisions by relevant authorities</li>
              <li>Standard contractual clauses</li>
              <li>Appropriate technical and organizational measures</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will delete it immediately.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. For significant changes, we will provide additional notice through the Service or email.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Information</h2>
            <p>
              For questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p><strong>Privacy Officer:</strong> privacy@lekhakai.com</p>
              <p><strong>General Inquiries:</strong> support@lekhakai.com</p>
              <p><strong>Website:</strong> www.lekhakai.com</p>
              <p><strong>Business Address:</strong> [Your Business Address]</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Compliance and Certifications</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>We comply with applicable Indian data protection laws</li>
              <li>Regular security audits and assessments</li>
              <li>Industry-standard security practices and protocols</li>
              <li>Commitment to data minimization and privacy by design</li>
            </ul>

            <div className="border-t border-border pt-6 mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2">Our Privacy Commitment</h3>
                <p className="text-sm">
                  We believe privacy is a fundamental right. We're committed to transparency, data minimization, and giving you control over your information. We will never sell your data or use it for purposes beyond providing our Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
