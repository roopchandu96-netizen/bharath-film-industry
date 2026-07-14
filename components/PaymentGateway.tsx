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
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI' | 'BANK'>('RAZORPAY');
  const [txnId, setTxnId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showRzpSimulator, setShowRzpSimulator] = useState(false);

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

  const simulateRazorpaySuccess = async () => {
    setProcessingPayment(true);
    try {
      const simulatedUTR = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
      const tier = getTierByAmount(amount);
      
      await recordInvestment(user.id, {
        userId: user.id,
        projectId: project.id,
        amount: amount,
        date: new Date().toISOString(),
        tier: tier,
        status: 'VERIFIED', // Autocleared since payment completed successfully via gateway
        txnId: simulatedUTR,
        investor: user.name,
        project: project.title,
        paymentMethod: 'Razorpay',
        email: user.email
      });

      await notifyInvestmentReceived(simulatedUTR, amount, user.name);

      setShowRzpSimulator(false);
      setStep('SUCCESS');
      setTimeout(onSuccess, 3000);
    } catch (e: any) {
      console.error(e);
      alert("Simulated transaction failed: " + e.message);
    } finally {
      setProcessingPayment(false);
    }
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
              
              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <button
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`py-3 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'bg-yellow-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <CreditCard size={12} /> Razorpay
                </button>
                <button
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-3 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'UPI'
                      ? 'bg-yellow-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <QrCode size={12} /> UPI QR
                </button>
                <button
                  onClick={() => setPaymentMethod('BANK')}
                  className={`py-3 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'BANK'
                      ? 'bg-yellow-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Landmark size={12} /> Bank
                </button>
              </div>

              {paymentMethod === 'RAZORPAY' && (
                <div className="p-8 bg-zinc-900 rounded-3xl space-y-6 border border-zinc-800 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Razorpay Secure Checkout</h3>
                    <p className="text-xs text-slate-400 px-4 leading-relaxed">
                      Complete your investment instantly using Credit/Debit Cards, Net Banking, or UPI via Razorpay.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRzpSimulator(true)}
                    className="w-full py-4 bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-blue-400 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    Proceed to Pay {CURRENCY_FORMATTER.format(amount)}
                  </button>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="p-6 bg-zinc-900 rounded-3xl space-y-6 border border-zinc-800 flex flex-col items-center">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest text-center">Scan QR code using any UPI App</p>
                  
                  <div className="relative w-40 aspect-square bg-white rounded-2xl p-2 shadow-xl border border-zinc-700/50 overflow-hidden">
                    <img 
                      src="/upi_qr.png" 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-center p-3 bg-black rounded-xl border border-zinc-800/50 w-full">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">UPI ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white">s0619553827098418@slc</span>
                        <button onClick={() => copyToClipboard('s0619553827098418@slc')} className="text-zinc-600 hover:text-yellow-500"><Copy size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'BANK' && (
                <div className="p-4 bg-zinc-900 rounded-3xl space-y-3 border border-zinc-800">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest text-center">Transfer funds to the following Official Account</p>

                  <div className="space-y-2">
                    {[
                      { label: 'Beneficiary Name', value: 'Bharat film industry' },
                      { label: 'Bank Name', value: 'Northeast Small Finance Bank' },
                      { label: 'Account Number', value: '033311501068467' },
                      { label: 'IFSC Code', value: 'NESF0000333' },
                      { label: 'Alternate IFSC Code', value: 'NESF0000096' },
                      { label: 'Account Type', value: 'Current / Escrow' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-black rounded-xl border border-zinc-800/50">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-white">{item.value}</span>
                          <button onClick={() => copyToClipboard(item.value)} className="text-zinc-600 hover:text-yellow-500"><Copy size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod !== 'RAZORPAY' && (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-500 italic text-center">
                    <Lock size={10} className="inline mr-1" />
                    Funds are held in a regulation-compliant escrow until project greenlight.
                  </p>
                  <button
                    onClick={() => setStep('CONFIRM')}
                    className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    I have transferred funds <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'CONFIRM' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Enter Transaction Reference ID (UTR)</label>
                  <input
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="e.g. UTR883920001"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-yellow-500 outline-none font-mono uppercase"
                  />
                </div>

                {/* Screenshot Upload Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">
                    Upload Payment Screenshot {paymentMethod === 'UPI' ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="w-full text-xs text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                  />
                  {uploadingScreenshot && <p className="text-[9px] text-yellow-500">Reading image file...</p>}
                  {screenshotUrl && (
                    <div className="mt-2 w-full max-h-32 rounded-xl overflow-hidden border border-zinc-800/80">
                      <img src={screenshotUrl} alt="Payment Screenshot Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-zinc-500 leading-relaxed px-2">
                  Please provide the transaction reference / UTR number provided by your app. Our verification team will verify the payment ledger within 24 hours.
                </p>

                {/* Investor Terms checkbox */}
                <div className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <input
                    type="checkbox"
                    required
                    id="accepted-investor-terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 accent-yellow-500 rounded border-zinc-800 bg-zinc-950 w-4 h-4 focus:ring-yellow-500 shrink-0"
                  />
                  <label htmlFor="accepted-investor-terms" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer select-none">
                    I accept the BFI <strong className="text-yellow-500">Investor Terms &amp; Conditions</strong> (including communication policy, risk disclosure, and loss acknowledgment). (Required)
                  </label>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!acceptedTerms || !txnId || (paymentMethod === 'UPI' && !screenshotUrl)}
                className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                <ShieldCheck size={16} /> Submit Verification
              </button>

              <button onClick={() => setStep('INSTRUCTIONS')} className="w-full text-[10px] text-zinc-500 uppercase font-bold hover:text-white">Back to Transfer Details</button>
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
                Status: Pending Clearance
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Razorpay Gateway Simulator overlay */}
      {showRzpSimulator && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-zinc-950 border border-blue-500/20 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm">R</div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Razorpay Checkout</h4>
                  <p className="text-[9px] text-zinc-500 font-mono">Sandbox Mode</p>
                </div>
              </div>
              <button onClick={() => setShowRzpSimulator(false)} className="text-zinc-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-zinc-900 rounded-xl space-y-2 border border-zinc-800">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Merchant:</span>
                <span className="font-bold text-white">Bharat Film Industry</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Amount:</span>
                <span className="font-bold text-blue-400">{CURRENCY_FORMATTER.format(amount)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-zinc-400 leading-normal">
                  This simulates Razorpay's checkout screen. Clicking **Simulate Success** will mock a successful payment, automatically creating a verified investment ledger record.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    alert("Razorpay payment cancelled.");
                    setShowRzpSimulator(false);
                  }}
                  className="py-3.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={simulateRazorpaySuccess}
                  disabled={processingPayment}
                  className="py-3.5 bg-blue-500 text-white hover:bg-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  {processingPayment ? <Loader2 size={12} className="animate-spin" /> : "Simulate Success"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGateway;