import React from 'react';
import { Shield, Lock, FileText, UserCheck, Smartphone, Trash2, ExternalLink } from 'lucide-react';

const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700 text-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest">
          <Shield size={12} /> BFI Security & User Data Protection
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Privacy <span className="text-emerald-500 italic">Policy</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          We are committed to protecting your privacy and ensuring transparency in how we collect, use, and safeguard your data.
        </p>
        <div className="text-xs font-mono text-slate-400 space-y-1">
          <p><strong>App:</strong> Bharat Film Industry (<code>com.bharatfilmindustry.app1</code>)</p>
          <p><strong>Effective Date:</strong> June 23, 2026 (Last Updated: October 26, 2026)</p>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Clause 1 */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm"><UserCheck size={16} /></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">1. Information We Collect</h3>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-4">
            <p>To provide a secure investment portal, ticket bookings, and decentralized filmmaking network, we collect:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Registration Details:</strong> Full name, email address, phone number (WhatsApp enabled), and account credentials.</li>
              <li><strong>Verification & KYC Information:</strong> Government identification documents, address proofs, and investor signatures required to comply with financial regulations and establish institutional producer credits.</li>
              <li><strong>Financial & Transaction Data:</strong> Investment amounts, transaction references, payment slips, and ticket booking details. Raw card or banking credentials are processed exclusively via RBI-approved payment gateways (Razorpay).</li>
              <li><strong>Device & Diagnostics Data:</strong> Device model, OS version, unique device identifiers, and system crash logs to ensure app performance and prevent unauthorized account access.</li>
            </ul>
          </div>
        </div>

        {/* Clause 2 */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm"><FileText size={16} /></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">2. How We Use Your Information</h3>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-3">
            <p>We use the collected information for specific, legitimate, and transparent purposes:</p>
            <ul className="list-decimal pl-5 space-y-2">
              <li><strong>To Provide and Maintain Our Service:</strong> Managing user registration, showing active projects, ticket bookings, and tracking producer credits.</li>
              <li><strong>To Facilitate Investments:</strong> Verifying payment confirmations, processing ledger transactions, and awarding appropriate Producer Tiers.</li>
              <li><strong>To Verify Identity (KYC):</strong> Preventing fraud, ensuring transaction legitimacy, and satisfying legal standards.</li>
              <li><strong>To Communicate with You:</strong> Sending notifications, WhatsApp support messages, and transaction updates.</li>
              <li><strong>To Ensure App Security:</strong> Monitoring for suspicious activity, protecting accounts, and enforcing terms.</li>
            </ul>
          </div>
        </div>

        {/* Clause 3 */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm"><Lock size={16} /></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">3. Data Storage & Security</h3>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-3">
            <p>
              All database transactions and user credentials are encrypted in transit via HTTPS/TLS and stored securely using industry-standard database providers (Supabase / Firebase). Sensitive data is encrypted at rest.
            </p>
            <p className="text-xs text-zinc-500">
              We retain personal data for as long as your account is active or as needed to comply with statutory and tax accounting obligations under Indian law.
            </p>
          </div>
        </div>

        {/* Clause 4 */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm"><Shield size={16} /></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">4. Third-Party Sharing</h3>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-2">
            <p>We <strong>never sell, trade, or rent</strong> your personal data to advertisers. We share information only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Service Providers:</strong> Supabase (Authentication/Database) and Razorpay (PCI-DSS compliant payment processing).</li>
              <li><strong>Legal Compliance:</strong> Law enforcement or judicial authorities when strictly required by applicable statutes.</li>
            </ul>
          </div>
        </div>

        {/* Clause 5 & 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-emerald-500/30 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <Trash2 size={18} />
              <h3>5. Data & Account Deletion</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              You have the full right to delete your account and personal data at any time:
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
              <li><strong>In-App:</strong> Profile &rarr; Danger Zone &rarr; "Revoke Institutional Node".</li>
              <li><strong>Web:</strong> <a href="https://www.bfiiy.com/delete-account" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline inline-flex items-center gap-1">Delete Account Web Form <ExternalLink size={10} /></a></li>
              <li><strong>Email:</strong> Send a deletion request to <strong>bharatfilmindustry@gmail.com</strong>. Processed within 7–30 days.</li>
            </ul>
          </div>

          <div className="bg-zinc-950 border border-slate-900 p-8 rounded-3xl space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">6. Children's Privacy</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our services are strictly intended for users aged 18 and older. We do not knowingly collect personal data from minors. If discovered, any minor data is immediately deleted.
            </p>
          </div>
        </div>
      </div>

      {/* Outro & Grievance Contact */}
      <div className="bg-zinc-950 border border-emerald-500/20 p-8 rounded-3xl space-y-4 text-center max-w-xl mx-auto">
        <div className="flex justify-center text-emerald-500"><Smartphone size={28} /></div>
        <h4 className="text-base font-bold text-white uppercase tracking-wider">Contact Us & Grievance Officer</h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          For any questions, requests, or grievances regarding this Privacy Policy, please reach out to:
        </p>
        <ul className="text-xs text-slate-300 space-y-1 mt-4">
          <li><strong>Email:</strong> <a href="mailto:bharatfilmindustry@gmail.com" className="text-emerald-400">bharatfilmindustry@gmail.com</a></li>
          <li><strong>WhatsApp:</strong> +91 9652919968</li>
          <li><strong>Developer / Officer:</strong> Prathapaneni Roopchandu</li>
          <li><strong>Entity:</strong> Bharat Film Industry</li>
          <li><strong>Registration:</strong> UDYAM-AP-23-0080757 / 37CZVPR2615G1ZU</li>
          <li><strong>Direct Web Policy:</strong> <a href="https://www.bfiiy.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://www.bfiiy.com/privacy-policy</a></li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyView;
