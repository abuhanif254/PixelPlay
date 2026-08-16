import { Metadata } from 'next';
import Link from 'next/link';

export const runtime = 'edge';


export const metadata: Metadata = {
  title: 'Cookie Policy | Spielcade',
  description: 'Understand how Spielcade uses cookies and similar technologies to improve your gaming experience, serve relevant ads, and analyze platform traffic.',
  alternates: {
    canonical: 'https://spielcade.com/cookies',
  },
  openGraph: {
    title: 'Cookie Policy | Spielcade',
    description: 'Understand how Spielcade uses cookies to improve your gaming experience.',
    url: 'https://spielcade.com/cookies',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
};

export default function CookiePolicy() {
  const lastUpdated = "August 16, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] py-16 md:py-24 transition-colors">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-outfit text-gray-900 dark:text-white tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last Updated: <span className="font-semibold text-gray-900 dark:text-gray-200">{lastUpdated}</span>
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-[#111228] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 prose prose-gray dark:prose-invert max-w-none prose-headings:font-outfit prose-headings:font-bold prose-a:text-[#6366F1] prose-a:no-underline hover:prose-a:underline">
            
            <p className="lead text-xl text-gray-600 dark:text-gray-300">
              This Cookie Policy explains how Spielcade ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website and use our gaming platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <hr className="border-gray-200 dark:border-white/10 my-8" />

            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by online service providers in order to make their websites or services work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, Spielcade) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., interactive gaming content, advertising, and analytics).
            </p>

            <h2>2. Why Do We Use Cookies?</h2>
            <p>
              We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our platform.
            </p>

            <h2>3. Types of Cookies We Use</h2>
            
            <h3>A. Essential Cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our platform and to use some of its features. For example, they allow you to log into secure areas of the platform (like your user profile), save your game progress securely, and protect against malicious activity.
            </p>

            <h3>B. Performance and Analytics Cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our platform is being used or how effective our marketing campaigns are, or to help us customize our platform for you. We use tools like Google Analytics to understand traffic patterns and optimize game loading speeds.
            </p>

            <h3>C. Functionality Cookies</h3>
            <p>
              These cookies are used to recognize you when you return to our platform. This enables us to personalize our content for you and remember your preferences (for example, your choice of language, volume settings, or dark/light mode preference).
            </p>

            <h3>D. Advertising / Targeting Cookies</h3>
            <p>
              Spielcade is supported by advertising. These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
            </p>

            <h2>4. Third-Party Game Cookies</h2>
            <p>
              When you play games hosted on Spielcade that are developed by third parties, those developers may also place cookies on your device. These cookies are usually used to save your local game state, high scores, or in-game settings. Spielcade does not control the placement of these third-party game cookies.
            </p>

            <h2>5. How Can I Control Cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager that appears when you first visit our site.
            </p>
            <p>
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, but your access to some functionality and areas of our website (like saving game progress or keeping you logged in) may be severely restricted.
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Manage Cookies in Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Manage Cookies in Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Manage Cookies in Apple Safari</a></li>
            </ul>

            <h2>6. Changes To This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
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
