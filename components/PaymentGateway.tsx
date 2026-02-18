import React, { useState } from 'react';
import {
  X, ShieldCheck, Landmark, CheckCircle, Copy, ArrowRight, Lock
} from 'lucide-react';
import { CURRENCY_FORMATTER } from '../constants';
import { MovieProject } from '../types';
import { notifyInvestmentReceived } from '../services/notificationService';

interface PaymentGatewayProps {
  project: MovieProject;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ project, amount, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'INSTRUCTIONS' | 'CONFIRM' | 'SUCCESS'>('INSTRUCTIONS');
  const [txnId, setTxnId] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const handleConfirm = async () => {
    if (!txnId) return alert('Please enter the Transaction Reference ID');

    // Notify Admin of verifyable investment
    await notifyInvestmentReceived(txnId, amount, "Investor (Online Portal)");

    setStep('SUCCESS');
    setTimeout(onSuccess, 3000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-950 border border-yellow-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">BFI Escrow Vault</h2>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Secure Institutional Transfer</p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl flex justify-between items-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Investment Amount</p>
              <p className="text-3xl font-serif text-yellow-500">{CURRENCY_FORMATTER.format(amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Project</p>
              <p className="text-sm font-bold text-white max-w-[150px] truncate">{project.title}</p>
            </div>
          </div>

          {step === 'INSTRUCTIONS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="p-4 bg-zinc-900 rounded-3xl space-y-4 border border-zinc-800">
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest text-center">Transfer funds to the following Official Account</p>

                <div className="space-y-3">
                  {[
                    { label: 'Beneficiary Name', value: 'BFI PRODUCTION VAULT LTD' },
                    { label: 'Bank Name', value: 'HDFC Bank, Mumbai' },
                    { label: 'Account Number', value: '00600340056789' },
                    { label: 'IFSC Code', value: 'HDFC0000060' },
                    { label: 'Account Type', value: 'Current / Escrow' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-black rounded-xl border border-zinc-800/50">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white">{item.value}</span>
                        <button onClick={() => copyToClipboard(item.value)} className="text-zinc-600 hover:text-yellow-500"><Copy size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500 italic text-center">
                  <Lock size={10} className="inline mr-1" />
                  Funds are held in a regulation-compliant escrow until project greenlight.
                </p>
                <button
                  onClick={() => setStep('CONFIRM')}
                  className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  I have transferred funds <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'CONFIRM' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Enter Transaction Reference ID (UTR)</label>
                <input
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. UTR883920001"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-500 outline-none font-mono uppercase"
                />
                <p className="text-[10px] text-zinc-500 leading-relaxed px-2">
                  Please provide the UTR/Reference number provided by your bank. Our clearance team will verify the detailed ledger within 24 hours.
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Submit Verification
              </button>

              <button onClick={() => setStep('INSTRUCTIONS')} className="w-full text-[10px] text-zinc-500 uppercase font-bold hover:text-white">Back to Bank Details</button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center py-10 space-y-6 animate-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Claim Registered</h3>
                <p className="text-zinc-400 text-xs px-8 leading-relaxed">
                  Your investment of <span className="text-white font-bold">{CURRENCY_FORMATTER.format(amount)}</span> is pending ledger verification. You will receive a Co-Producer Certificate upon clearance.
                </p>
              </div>
              <div className="p-3 bg-zinc-900 text-yellow-500 font-mono text-[10px] rounded-lg tracking-widest uppercase">
                Status: Pending Clearance
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;