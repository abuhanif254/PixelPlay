import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { Mail, MapPin, MessageSquare, Clock } from 'lucide-react';

export const runtime = 'edge';


export const metadata: Metadata = {
  title: 'Contact Us | Spielcade',
  description: 'Get in touch with the Spielcade support team. We are here to help with your account, game issues, or business inquiries.',
  alternates: {
    canonical: 'https://spielcade.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Spielcade',
    description: 'Get in touch with the Spielcade support team.',
    url: 'https://spielcade.com/contact',
    siteName: 'Spielcade',
    locale: 'en_US',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050F] pb-24 transition-colors">
      
      {/* Hero Section */}
      <div className="bg-[#6366F1] dark:bg-[#0A0A1B] text-white pt-24 pb-32 px-4 relative overflow-hidden border-b border-[#6366F1]/20">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black font-outfit mb-6">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Whether you have a question about features, trials, pricing, need a demo, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#111228] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 h-full">
              <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-8">Contact Information</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Us</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Our friendly team is here to help.</p>
                    <a href="mailto:support@spielcade.com" className="text-[#6366F1] font-medium hover:underline">support@spielcade.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 text-green-600 dark:text-green-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Live Support</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Join our Discord community for quick help.</p>
                    <a href="#" className="text-[#6366F1] font-medium hover:underline">Join Discord Server</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Operating Hours</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Monday - Friday</p>
                    <p className="text-gray-900 dark:text-gray-300 font-medium text-sm">9:00 AM - 6:00 PM (EST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Office Location</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      123 Gaming Boulevard<br />
                      Suite 404<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111228] p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
              <h2 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white mb-2">Send us a Message</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">We will usually get back to you within 24 hours.</p>
              
              <ContactForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
