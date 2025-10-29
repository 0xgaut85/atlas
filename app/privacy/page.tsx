'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-5xl sm:text-6xl font-normal font-title mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-12">Last updated: January 2025</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Atlas402 ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our x402 protocol infrastructure and marketplace services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-white mt-6 mb-3">Blockchain and Wallet Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you connect your wallet to use our services, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Public wallet addresses</li>
                <li>Transaction data on public blockchains (Base, Solana, Polygon, BSC, Sei, Peaq)</li>
                <li>Blockchain transaction hashes and timestamps</li>
                <li>Payment amounts and recipient addresses</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">Usage Information</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                We automatically collect certain information when you use our platform:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Browser type and version</li>
                <li>Device information and operating system</li>
                <li>IP address and general location data</li>
                <li>Pages viewed and time spent on our platform</li>
                <li>API and service usage metrics</li>
              </ul>

              <h3 className="text-xl font-medium text-white mt-6 mb-3">Service Registration Data</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you register a service on our marketplace:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Service name, description, and pricing</li>
                <li>API endpoints and documentation</li>
                <li>Payment recipient wallet addresses</li>
                <li>Service category and metadata</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the collected information for:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Facilitating x402 protocol micropayments and transactions</li>
                <li>Providing marketplace infrastructure and service discovery</li>
                <li>Processing and verifying blockchain transactions</li>
                <li>Maintaining and improving our platform</li>
                <li>Analyzing usage patterns and optimizing performance</li>
                <li>Preventing fraud, abuse, and security incidents</li>
                <li>Complying with legal obligations and enforcing our Terms</li>
                <li>Communicating important updates about our services</li>
              </ul>
            </section>

            {/* Blockchain Transparency */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Blockchain Transparency</h2>
              <p className="text-gray-300 leading-relaxed">
                All transactions processed through Atlas402 are recorded on public blockchains. This means transaction data, including wallet addresses, amounts, and timestamps, are permanently visible on the blockchain and cannot be deleted or modified. We have no control over blockchain data once transactions are confirmed.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third-party blockchain networks and node providers</li>
                <li><strong>x402 Protocol:</strong> PayAI facilitator infrastructure for payment processing</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
            </section>

            {/* Non-Custodial Nature */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Non-Custodial Infrastructure</h2>
              <p className="text-gray-300 leading-relaxed">
                Atlas402 operates as non-custodial infrastructure. We never hold, control, or have access to your private keys or funds. All transactions are peer-to-peer between users and service providers. You maintain full control over your wallet and assets at all times.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, secure connections (HTTPS), and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access to the information we hold about you</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information (subject to legal requirements)</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Note: Blockchain transaction data cannot be deleted due to the immutable nature of blockchain technology.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Cookies and Tracking Technologies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze platform usage, and maintain session information. You can control cookie preferences through your browser settings, though this may affect platform functionality.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed">
                Our platform integrates with third-party services including blockchain networks, wallet providers (MetaMask, Phantom, etc.), and the PayAI x402 protocol infrastructure. These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">International Users</h2>
              <p className="text-gray-300 leading-relaxed">
                Atlas402 operates globally. If you access our services from outside the United States, your information may be transferred to, stored, and processed in countries where we operate. By using our services, you consent to such transfers.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect information from children. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-white/10 pt-8 mt-12">
              <h2 className="text-3xl font-medium text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-gray-300"><strong>Email:</strong> privacy@atlas402.com</p>
                <p className="text-gray-300 mt-2"><strong>Twitter:</strong> <a href="https://x.com/atlas402dotcom" className="text-red-600 hover:text-red-700">@atlas402dotcom</a></p>
                <p className="text-gray-300 mt-2"><strong>Telegram:</strong> <a href="https://t.me/xatlas402" className="text-red-600 hover:text-red-700">@xatlas402</a></p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

