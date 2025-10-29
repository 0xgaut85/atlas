'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
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

          <h1 className="text-5xl sm:text-6xl font-normal font-title mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-12">Last updated: January 2025</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Agreement to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use of Atlas402's x402 protocol infrastructure, marketplace, and related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use our Services.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Service Description</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Atlas402 provides infrastructure for the x402 protocol ecosystem, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Marketplace aggregation for x402-enabled APIs and digital services</li>
                <li>Service discovery and testing infrastructure</li>
                <li>Payment orchestration for pay-per-request transactions</li>
                <li>Integration tools and documentation</li>
                <li>Multi-chain blockchain payment support</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We are infrastructure built on top of the x402 protocol (developed by PayAI), not the creators of the protocol itself.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Eligibility</h2>
              <p className="text-gray-300 leading-relaxed">
                You must be at least 18 years old and have the legal capacity to enter into binding contracts to use our Services. By using our Services, you represent and warrant that you meet these requirements and comply with all applicable laws and regulations in your jurisdiction.
              </p>
            </section>

            {/* Non-Custodial Services */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Non-Custodial Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong>Important:</strong> Atlas402 is a non-custodial platform. We do not:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Hold, store, or control your private keys or funds</li>
                <li>Have access to your wallet or cryptocurrencies</li>
                <li>Process or custody any payments—all transactions are peer-to-peer</li>
                <li>Act as an intermediary or escrow service</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                You are solely responsible for maintaining the security of your wallet, private keys, and funds. Loss of private keys may result in permanent loss of access to your digital assets.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">User Responsibilities</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                When using our Services, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your wallet and private keys</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the Services for illegal activities or fraud</li>
                <li>Not attempt to disrupt, harm, or compromise the platform</li>
                <li>Not violate intellectual property rights</li>
                <li>Verify transaction details before confirming blockchain transactions</li>
                <li>Understand that blockchain transactions are irreversible</li>
              </ul>
            </section>

            {/* Service Providers */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Service Providers and Listings</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you register a service on our marketplace, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide accurate service information and documentation</li>
                <li>Maintain service availability and reliability</li>
                <li>Implement proper x402 protocol integration</li>
                <li>Set fair and transparent pricing</li>
                <li>Comply with all applicable laws regarding your service</li>
                <li>Not offer illegal, harmful, or fraudulent services</li>
                <li>Handle user data responsibly and securely</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We reserve the right to remove any service listing that violates these Terms or is deemed inappropriate.
              </p>
            </section>

            {/* Blockchain Transactions */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Blockchain Transactions</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All transactions are executed on public blockchains and are subject to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Network fees (gas fees) determined by blockchain networks</li>
                <li>Transaction confirmation times varying by network congestion</li>
                <li>Irreversibility—transactions cannot be canceled or reversed</li>
                <li>Public visibility—all transaction data is permanently recorded</li>
                <li>Smart contract risks and potential vulnerabilities</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong>You acknowledge that:</strong> Atlas402 has no control over blockchain networks, transaction processing, or confirmation times. We are not responsible for failed transactions, network fees, or blockchain-related issues.
              </p>
            </section>

            {/* Fees */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Fees and Payments</h2>
              <p className="text-gray-300 leading-relaxed">
                Service providers set their own pricing for x402-enabled services. You agree to pay the specified amounts for services you consume. Additionally, you are responsible for all blockchain network fees (gas fees) associated with your transactions. Atlas402 may introduce platform fees in the future with advance notice.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The Atlas402 platform, including its design, code, content, and trademarks, is owned by us or our licensors and is protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Copy, modify, or distribute our platform or content</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use our trademarks without permission</li>
                <li>Remove or alter any proprietary notices</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Disclaimers and Limitations</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-4">
                <p className="text-yellow-200 font-medium mb-2">⚠️ IMPORTANT DISCLAIMERS</p>
                <p className="text-gray-300 text-sm">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                </p>
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">
                We specifically disclaim:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Warranties of merchantability, fitness for a particular purpose</li>
                <li>Guarantees of uninterrupted or error-free service</li>
                <li>Responsibility for third-party services listed on our marketplace</li>
                <li>Liability for blockchain network issues or failures</li>
                <li>Guarantees of transaction success or finality</li>
                <li>Protection against wallet compromises or key loss</li>
                <li>Responsibility for regulatory compliance in your jurisdiction</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOVA402 AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Failed transactions or blockchain-related losses</li>
                <li>Unauthorized access to your wallet or funds</li>
                <li>Third-party service failures or misconduct</li>
                <li>Smart contract vulnerabilities or exploits</li>
                <li>Regulatory actions or legal consequences</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Our total liability shall not exceed $100 or the amount you paid us in fees in the past 12 months, whichever is greater.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Indemnification</h2>
              <p className="text-gray-300 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Atlas402 and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Services, violation of these Terms, or infringement of any rights of third parties.
              </p>
            </section>

            {/* Risk Acknowledgment */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Risk Acknowledgment</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You acknowledge and accept the risks associated with blockchain technology and cryptocurrency transactions, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Price volatility of cryptocurrencies</li>
                <li>Irreversibility of blockchain transactions</li>
                <li>Potential for smart contract bugs or vulnerabilities</li>
                <li>Regulatory uncertainty and potential legal changes</li>
                <li>Risk of loss due to wallet compromise or key loss</li>
                <li>Network congestion and variable transaction fees</li>
                <li>Potential for service provider misconduct or fraud</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to suspend or terminate your access to the Services at any time, with or without cause or notice, for violation of these Terms or any reason we deem appropriate. You may stop using the Services at any time. Provisions that by their nature should survive termination will continue to apply.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Dispute Resolution</h2>
              <p className="text-gray-300 leading-relaxed">
                Any disputes arising from these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive your right to participate in class actions. This arbitration clause does not prevent you from bringing issues to the attention of regulatory authorities.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Changes to These Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting with an updated "Last updated" date. Your continued use of the Services after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            {/* Miscellaneous */}
            <section>
              <h2 className="text-3xl font-medium text-white mb-4">Miscellaneous</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Atlas402 regarding the Services.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong>No Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign these Terms without restriction.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t border-white/10 pt-8 mt-12">
              <h2 className="text-3xl font-medium text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-gray-300"><strong>Email:</strong> legal@nova402.com</p>
                <p className="text-gray-300 mt-2"><strong>Twitter:</strong> <a href="https://x.com/atlas402dotcom" className="text-red-600 hover:text-red-700">@atlas402dotcom</a></p>
                <p className="text-gray-300 mt-2"><strong>Telegram:</strong> <a href="https://t.me/xnova402" className="text-red-600 hover:text-red-700">@xnova402</a></p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

