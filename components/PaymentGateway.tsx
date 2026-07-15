import React, { useState } from 'react';
import {
  X, ShieldCheck, Landmark, CheckCircle, Copy, ArrowRight, Lock, QrCode, CreditCard, Loader2, AlertCircle
} from 'lucide-react';
import { CURRENCY_FORMATTER, TIERS } from '../constants';
import { MovieProject, User, ProducerTier } from '../types';
import { notifyInvestmentReceived } from '../services/notificationService';
import { recordInvestment } from '../services/investmentService';

interface PaymentGatewayProps {
  project: MovieProject;
  amount: number;
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ project, amount, user, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'INSTRUCTIONS' | 'CONFIRM' | 'SUCCESS'>('INSTRUCTIONS');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY'>('RAZORPAY');
  const [txnId, setTxnId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const getTierByAmount = (amount: number): ProducerTier => {
    const tier = TIERS.find(t => amount >= t.min && amount <= t.max);
    return tier ? tier.name : ProducerTier.SUPPORTER;
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotUrl(reader.result as string);
      setUploadingScreenshot(false);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
      setUploadingScreenshot(false);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'UPI' && !screenshotUrl) {
      return alert('Please upload a screenshot of your payment verification.');
    }
    if (!txnId.trim()) return alert('Please enter the Transaction Reference ID (UTR / Txn ID)');
    if (!acceptedTerms) return alert('Please read and accept the terms and conditions');

    try {
      const tier = getTierByAmount(amount);
      await recordInvestment(user.id, {
        userId: user.id,
        projectId: project.id,
        amount: amount,
        date: new Date().toISOString(),
        tier: tier,
        status: 'PENDING',
        txnId: txnId.trim(),
        investor: user.name,
        project: project.title,
        screenshot: screenshotUrl || undefined,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI QR' : 'Bank Transfer',
        email: user.email
      });

      // Notify Admin of verifiable investment
      await notifyInvestmentReceived(txnId.trim(), amount, user.name);

      setStep('SUCCESS');
      setTimeout(onSuccess, 3000);
    } catch (e: any) {
      console.error(e);
      alert(`Payment registration failed: ${e.message || "Check connection."}`);
    }
  };

  const handleRazorpayCheckout = () => {
    if (!acceptedTerms) {
      alert("Please read and accept the terms and conditions first.");
      return;
    }
    setProcessingPayment(true);
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TCx8Bwnh4y2e2A',
      amount: amount * 100, // in paise
      currency: "INR",
      name: "Bharat Film Industry",
      description: `Investment in ${project.title}`,
      handler: async function (response: any) {
        try {
          const tier = getTierByAmount(amount);
          
          await recordInvestment(user.id, {
            userId: user.id,
            projectId: project.id,
            amount: amount,
            date: new Date().toISOString(),
            tier: tier,
            status: 'VERIFIED',
            txnId: response.razorpay_payment_id,
            investor: user.name,
            project: project.title,
            paymentMethod: 'Razorpay',
            email: user.email
          });

          await notifyInvestmentReceived(response.razorpay_payment_id, amount, user.name);

          setStep('SUCCESS');
          setTimeout(onSuccess, 3000);
        } catch (e: any) {
          console.error(e);
          alert("Investment registration failed: " + e.message);
        } finally {
          setProcessingPayment(false);
        }
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: {
        color: "#EAB308"
      },
      modal: {
        ondismiss: function () {
          setProcessingPayment(false);
        }
      }
    };
    
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-950 border border-yellow-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl relative my-8">
        <button onClick={onCancel} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center shrink-0">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-white">BFI Escrow Vault</h2>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Secure Institutional Transfer</p>
            </div>
          </div>

          {/* Amount Display */}
          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl flex justify-between items-center gap-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Investment Amount</p>
              <p className="text-2xl md:text-3xl font-serif text-yellow-500">{CURRENCY_FORMATTER.format(amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Project</p>
              <p className="text-sm font-bold text-white max-w-[150px] truncate">{project.title}</p>
            </div>
          </div>

          {step === 'INSTRUCTIONS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              
              <div className="p-8 bg-zinc-900 rounded-3xl space-y-6 border border-zinc-800 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center animate-pulse">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Razorpay Secure Checkout</h3>
                  <p className="text-xs text-slate-400 px-4 leading-relaxed">
                    Complete your investment instantly using Credit/Debit Cards, Net Banking, Wallets, or UPI via Razorpay.
                  </p>
                </div>
              </div>

              {/* Investor Terms checkbox */}
              <div className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <input
                  type="checkbox"
                  required
                  id="accepted-investor-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-4 h-4 focus:ring-yellow-500 shrink-0 cursor-pointer"
                />
                <label htmlFor="accepted-investor-terms" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                  I accept the BFI <strong className="text-yellow-500">Investor Terms &amp; Conditions</strong> (including communication policy, risk disclosure, and loss acknowledgment). (Required)
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500 italic text-center">
                  <Lock size={10} className="inline mr-1" />
                  Funds are held in a regulation-compliant escrow until project greenlight.
                </p>
                <button
                  onClick={handleRazorpayCheckout}
                  disabled={!acceptedTerms || processingPayment}
                  className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {processingPayment ? <Loader2 size={16} className="animate-spin" /> : <>Proceed to Pay {CURRENCY_FORMATTER.format(amount)}</>}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center py-10 space-y-6 animate-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Investment Logged Successfully</h3>
                <p className="text-zinc-400 text-xs px-8 leading-relaxed">
                  Your investment of <span className="text-white font-bold">{CURRENCY_FORMATTER.format(amount)}</span> has been successfully logged. Redirecting to your dashboard...
                </p>
              </div>
              <div className="p-3 bg-zinc-900 text-yellow-500 font-mono text-[10px] rounded-lg tracking-widest uppercase border border-zinc-800">
                Status: Verified (Paid)
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;