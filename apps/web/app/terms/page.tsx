import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Spielcade',
  description: 'Read the terms and conditions for using Spielcade, the premier online browser games platform. Learn about user rights, intellectual property, and acceptable use.',
  alternates: {
    canonical: 'https://spielcade.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | Spielcade',
    description: 'Read the terms and conditions for using Spielcade.',
    url: 'https://spielcade.com/terms',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
};

export default function TermsOfService() {
  const lastUpdated = "August 16, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] py-16 md:py-24 transition-colors">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-outfit text-gray-900 dark:text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last Updated: <span className="font-semibold text-gray-900 dark:text-gray-200">{lastUpdated}</span>
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none prose-headings:font-outfit prose-headings:font-bold prose-a:text-[#6366F1] prose-a:no-underline hover:prose-a:underline">
            
            <p className="lead text-xl text-gray-600 dark:text-gray-300">
              Welcome to Spielcade. These Terms of Service ("Terms") govern your access to and use of the Spielcade website, platform, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            <hr className="border-gray-200 dark:border-white/10 my-8" />

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Spielcade, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. User Accounts and Security</h2>
            <p>
              To access certain features of the Services, such as saving game progress, earning achievements, or participating in leaderboards, you may be required to register for an account.
            </p>
            <ul>
              <li><strong>Accuracy:</strong> You must provide accurate and complete registration information.</li>
              <li><strong>Security:</strong> You are responsible for safeguarding the password that you use to access the Services and for any activities or actions under your password.</li>
              <li><strong>Age Restriction:</strong> You must be at least 13 years of age to create an account. If you are under 18, you must have your parent or legal guardian's permission to use the Services.</li>
            </ul>

            <h2>3. Intellectual Property Rights</h2>
            <p>
              The Services and their original content, features, and functionality are and will remain the exclusive property of Spielcade and its licensors. The Services are protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            <p>
              <strong>Third-Party Games:</strong> Many games hosted on Spielcade are developed by third-party creators. These developers retain the intellectual property rights to their respective games. Spielcade has secured the necessary licenses or permissions to distribute and host these games on our platform.
            </p>

            <h2>4. Acceptable Use Policy</h2>
            <p>
              You agree not to misuse our Services. You may not:
            </p>
            <ul>
              <li>Use the Services for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Violate or encourage others to violate any right of a third party, including by infringing or misappropriating any third party intellectual property right.</li>
              <li>Interfere with security-related features of the Services, including by disabling or circumventing features that prevent or limit use or copying of any content.</li>
              <li>Interfere with the operation of the Services or any user's enjoyment of the Services, including by uploading or otherwise disseminating any virus, adware, spyware, worm, or other malicious code.</li>
              <li>Attempt to artificially manipulate leaderboards, achievements, or any other competitive aspect of the platform through bots, scripts, or exploits.</li>
            </ul>

            <h2>5. User-Generated Content (Comments & Reviews)</h2>
            <p>
              Our platform allows users to post reviews, comments, and engage in discussions. By posting content, you grant Spielcade a non-exclusive, worldwide, royalty-free, irrevocable, sub-licensable, perpetual license to use, display, edit, modify, reproduce, distribute, store, and prepare derivative works of your content.
            </p>
            <p>
              You are solely responsible for the content that you post. Spielcade reserves the right to remove any content that we determine, in our sole discretion, violates these Terms or is otherwise inappropriate, offensive, or harmful.
            </p>

            <h2>6. Virtual Currency and Monetization</h2>
            <p>
              Spielcade may offer virtual currency, tokens, or premium subscriptions. 
              These virtual items have no real-world value and cannot be redeemed for actual currency, goods, or other items of monetary value from Spielcade or any other party. 
              All purchases of virtual items or subscriptions are final and non-refundable, except where required by applicable law.
            </p>

            <h2>7. Developer Revenue Share</h2>
            <p>
              Developers who publish games on Spielcade may be eligible to earn revenue from in-game advertisements (such as Rewarded Ads) or platform engagement. 
            </p>
            <p>
              The standard revenue split is <strong>70% to the Developer</strong> and <strong>30% to Spielcade</strong> of the net advertising revenue generated directly from the developer's game(s). Spielcade reserves the right to modify this revenue share at any time, but will provide at least 30 days' notice of any changes. Payouts are subject to minimum withdrawal thresholds and our Developer Studio Guidelines.
            </p>

            <h2>8. Advertisements and Third-Party Links</h2>
            <p>
              Spielcade is supported by advertising. By using the Services, you agree that Spielcade may place advertising on the platform, including video advertisements that play before or during gameplay. 
            </p>
            <p>
              Our Services may contain links to third-party web sites or services that are not owned or controlled by Spielcade. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Services will immediately cease.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              In no event shall Spielcade, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul>
              <li>Your access to or use of or inability to access or use the Services;</li>
              <li>Any conduct or content of any third party on the Services;</li>
              <li>Any content obtained from the Services; and</li>
              <li>Unauthorized access, use or alteration of your transmissions or content.</li>
            </ul>

            <h2>11. Disclaimer</h2>
            <p>
              Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>

            <h2>12. Changes to These Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <Link href="/contact"><strong>legal@spielcade.com</strong></Link><br />
              Alternatively, you can reach out via our <Link href="/contact">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
