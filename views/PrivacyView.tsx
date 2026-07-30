import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, UserCheck, Smartphone } from 'lucide-react';

const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700 text-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest">
          <Shield size={12} /> BFI Security
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Privacy <span className="text-emerald-500 italic">Policy</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          We are committed to protecting your privacy and ensuring transparency in how we collect, use, and safeguard your data.
        </p>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Effective Date: June 23, 2026</p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Clause 1 */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm"><UserCheck size={16} /></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">1. Information We Collect</h3>
          </div>
          <div className="text-slate-400 text-sm leading-relaxed space-y-4">
            <p>To provide a secure investment portal and decentralized production network, we collect several types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Registration Details:</strong> When you create an account, we collect your Name, Email Address, Contact Number (WhatsApp/Phone), and account passwords.</li>
              <li><strong>Verification & KYC Information:</strong> To comply with financial regulations and establish producer credits, we may collect verification documents, government IDs, address proofs, and investor signatures.</li>
              <li><strong>Financial & Investment Data:</strong> We track investment amounts, transaction receipts, bank transfer confirmation slips, and payment details you upload to facilitate and verify investments.</li>
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
            <p>We use the collected information for the following specific and transparent purposes:</p>
            <ul className="list-decimal pl-5 space-y-2">
              <li><strong>To Provide and Maintain Our Service:</strong> Including managing user registration, showing active projects, and keeping track of producer tiers.</li>
              <li><strong>To Facilitate Investments:</strong> Verifying payment confirmations, processing bank transfer claims, and awarding appropriate Producer Tiers.</li>
              <li><strong>To Verify Identity (KYC):</strong> Ensuring transactions are legitimate and preventing financial fraud on the platform.</li>
              <li><strong>To Communicate with You:</strong> Sending notifications, WhatsApp support messages, and transaction updates.</li>
              <li><strong>To Ensure App Security:</strong> Monitoring for suspicious activity, protecting user accounts, and enforcing our terms.</li>
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
              All database transactions and user credentials are encrypted and stored securely using industry-standard database providers (e.g., Supabase, Firebase). We retain your personal data for as long as your account is active or as needed to comply with legal obligations.
            </p>
            <p className="text-xs text-zinc-500">
              We implement a variety of technical and organizational security measures to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.
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
            <p>We <strong>do not sell, trade, or rent</strong> your personal data to third parties. We only share information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Service Providers:</strong> Infrastructure and cloud hosting providers necessary to run the App.</li>
              <li><strong>Legal Compliance:</strong> Law enforcement or regulatory authorities when required by law or to protect the safety and integrity of our platform.</li>
            </ul>
          </div>
        </div>

        {/* Clause 5 & 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-slate-900 p-8 rounded-3xl space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">5. Data Deletion</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              You have the right to request the deletion of your personal data at any time. Submit your request to <strong>bharatfilmindustry@gmail.com</strong>. We will process and confirm your deletion request within 30 days.
            </p>
          </div>

          <div className="bg-zinc-950 border border-slate-900 p-8 rounded-3xl space-y-3">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">6. Children's Privacy</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our services are not intended for use by children under the age of 18. We do not knowingly collect personal data from anyone under 18. If discovered, it will be deleted immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Outro */}
      <div className="bg-zinc-950 border border-emerald-500/20 p-8 rounded-3xl space-y-4 text-center max-w-xl mx-auto">
        <div className="flex justify-center text-emerald-500"><Smartphone size={28} /></div>
        <h4 className="text-base font-bold text-white uppercase tracking-wider">Contact Us</h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:
        </p>
        <ul className="text-xs text-slate-300 space-y-1 mt-4">
          <li><strong>Email:</strong> bharathfilmindustry@gmail.com</li>
          <li><strong>WhatsApp:</strong> +91 9652919968</li>
          <li><strong>Developer:</strong> Prathapaneni Roopchandu</li>
          <li><strong>LEI Code:</strong> UDYAM-AP-23-0080757 / 37CZVPR2615G1ZU</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyView;
