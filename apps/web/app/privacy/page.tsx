import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Spielcade',
  description: 'Learn how Spielcade collects, uses, and protects your personal data. Read our comprehensive Privacy Policy regarding browser games, user accounts, and advertising.',
  alternates: {
    canonical: 'https://spielcade.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Spielcade',
    description: 'Learn how Spielcade collects, uses, and protects your personal data.',
    url: 'https://spielcade.com/privacy',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
};

export default function PrivacyPolicy() {
  const lastUpdated = "August 16, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] py-16 md:py-24 transition-colors">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-outfit text-gray-900 dark:text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last Updated: <span className="font-semibold text-gray-900 dark:text-gray-200">{lastUpdated}</span>
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none prose-headings:font-outfit prose-headings:font-bold prose-a:text-[#6366F1] prose-a:no-underline hover:prose-a:underline">
            
            <p className="lead text-xl text-gray-600 dark:text-gray-300">
              At Spielcade, your privacy is our priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our browser gaming platform.
            </p>

            <hr className="border-gray-200 dark:border-white/10 my-8" />

            <h2>1. Information We Collect</h2>
            <p>
              We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("Personal Information"). We may collect the following categories of Personal Information:
            </p>
            <ul>
              <li><strong>Account Information:</strong> If you register for a Spielcade account, we collect your username, email address, password, and avatar image.</li>
              <li><strong>Usage Data:</strong> We automatically collect information regarding your interactions with the platform, including games played, achievements unlocked, session durations, and browser type.</li>
              <li><strong>Device Information:</strong> We collect your IP address, operating system, and hardware type to optimize game performance and prevent fraudulent activity.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Services to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions.</li>
              <li>Monitor and analyze usage and trends to improve your experience.</li>
              <li>Save your game progress, high scores, and unlockables to our cloud database (Supabase).</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>

            <h2>3. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <p>
              <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services (Vercel), customer service, and marketing assistance.
            </p>
            <p>
              <strong>Third-Party Game Developers:</strong> When you play a third-party game on our platform, certain non-identifiable usage statistics may be shared with the developer to help them improve their game.
            </p>
            <p>
              <strong>Legal Obligations:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
            </p>

            <h2>4. Third-Party Advertising and Google AdSense</h2>
            <p>
              Spielcade uses Google AdSense and other trusted third-party advertising vendors to display advertisements across our Services. We are committed to transparency regarding how advertising cookies and data are utilized to support our free gaming platform.
            </p>
            <ul>
              <li>
                <strong>Google Advertising Cookies:</strong> Google, as a third-party vendor, uses cookies (including the DoubleClick / DART cookie) to serve advertisements on Spielcade. Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visits to Spielcade and other sites across the Internet.
              </li>
              <li>
                <strong>Personalized vs. Non-Personalized Ads:</strong> Advertisements displayed on Spielcade may be personalized based on your general browsing patterns, or non-personalized based on page context and gameplay category.
              </li>
              <li>
                <strong>Opting Out of Personalized Ads:</strong> You may opt out of personalized advertising from Google by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You may also opt out of third-party vendor use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a> or <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">Your Online Choices</a>.
              </li>
              <li>
                <strong>How Google Uses Data:</strong> For comprehensive details on how Google collects, shares, and protects information when you visit partner sites and use our gaming platform, please review the official Google disclosure: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from sites or apps that use our services</a>.
              </li>
            </ul>
            <p>
              You can also manage or modify your cookie consent preferences at any time using our platform&apos;s <Link href="/cookies">Cookie Policy</Link> controls or via your web browser settings.
            </p>

            <h2>5. Your Data Protection Rights (GDPR & CCPA)</h2>
            <p>
              Depending on your location, you may have the following rights regarding your Personal Information:
            </p>
            <ul>
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure ("Right to be Forgotten"):</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to opt-out:</strong> You have the right to opt-out of the sale of your personal information (applicable to California residents under the CCPA).</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided below.
            </p>

            <h2>6. Policy for Children (COPPA & GDPR Art. 8 Compliance)</h2>
            <p>
              Spielcade is committed to protecting the online privacy of children and complying with the <strong>Children&apos;s Online Privacy Protection Act (COPPA)</strong> in the United States and <strong>Article 8 of the General Data Protection Regulation (GDPR)</strong> in the European Economic Area and United Kingdom.
            </p>
            <p>
              <strong>Age Gating & Safe Harbor Controls:</strong> Our platform incorporates an upfront age certification and cookie consent mechanism. If a user indicates they are under 13 years of age (or under 16 in the EEA/UK):
            </p>
            <ul>
              <li><strong>Zero Behavioral Profiling:</strong> We do not track, profile, or serve personalized interest-based advertisements to minors.</li>
              <li><strong>Zero Non-Essential Cookies:</strong> All marketing trackers, analytics cookies, and cross-site beacons remain permanently disabled.</li>
              <li><strong>Functional Gameplay Only:</strong> Only strictly essential, non-identifying local storage (such as saving local level progress and game audio preferences) is utilized.</li>
            </ul>
            <p>
              <strong>Parental Rights:</strong> Parents and legal guardians have the right to review any information collected from their child, request immediate deletion of any such data, and refuse further collection or use. If you believe your child has provided us with personal information without parental consent, please contact our Data Protection Officer immediately at <a href="mailto:privacy@spielcade.com"><strong>privacy@spielcade.com</strong></a> or via our <Link href="/contact">Contact Page</Link>, and we will delete the data within 24 hours.
            </p>

            <h2>7. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p>
              <Link href="/contact"><strong>privacy@spielcade.com</strong></Link><br />
              Alternatively, you can reach out via our <Link href="/contact">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
