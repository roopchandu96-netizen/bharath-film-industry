import React, { useState } from 'react';
import { FileText, Sparkles, Upload, Loader2, CheckCircle, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { SmartAgreement, FileRecord } from '../types';
import { generateAgreementFromDoc } from '../services/fileService';

interface AgreementGeneratorProps {
  uid: string;
  onBack: () => void;
  onFinished: (record: FileRecord) => void;
}

const AgreementGenerator: React.FC<AgreementGeneratorProps> = ({ uid, onBack, onFinished }) => {
  const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'REVIEW'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [agreement, setAgreement] = useState<SmartAgreement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setStep('PROCESSING');
    try {
      const { record, agreement } = await generateAgreementFromDoc(uid, file);
      setAgreement(agreement);
      setStep('REVIEW');
      onFinished(record);
    } catch (err) {
      setError("Legal analysis failed. Please check the document format.");
      setStep('UPLOAD');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold gold-gradient">Smart Agreement</h1>
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">AI Legal Drafting</p>
          </div>
        </div>

        {step === 'UPLOAD' && (
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 border-dashed text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-yellow-400/5 border border-yellow-400/10 flex items-center justify-center mx-auto text-yellow-400">
                <FileText size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Source Document</h3>
                <p className="text-xs text-zinc-500">Upload a term sheet, script, or memorandum to begin the automated drafting process.</p>
              </div>
              
              <label className="block">
                <div className="w-full py-4 bg-zinc-800 rounded-2xl border border-zinc-700 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-zinc-700 transition-colors">
                  {file ? file.name : "Select File"}
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>

              {file && (
                <button 
                  onClick={handleGenerate}
                  className="w-full py-5 rounded-2xl gold-bg text-black font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-yellow-400/10 active:scale-95 transition-all"
                >
                  <Sparkles size={18} />
                  Draft Agreement
                </button>
              )}
            </div>

            <div className="p-5 rounded-3xl bg-zinc-900/30 border border-zinc-800 space-y-4">
              <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-yellow-400" /> BFI Legal Standards
              </h4>
              <ul className="space-y-3">
                {['SEBI Compliant Framework', 'Pan-India Jurisdiction Clauses', 'Automated IP Rights Assignment'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <CheckCircle size={10} className="text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-zinc-800 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-yellow-400" size={48} />
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400/10 p-2 rounded-xl border border-yellow-400/20">
                <Sparkles className="text-yellow-400" size={20} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-serif gold-gradient">AI Lawyer at Work</h2>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-loose">
                Analyzing clauses from {file?.name}...<br/>
                Mapping BFI Compliance Protocols...<br/>
                Generating Legal Master Document...
              </p>
            </div>
          </div>
        )}

        {step === 'REVIEW' && agreement && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-h-[60vh] overflow-y-auto text-black font-serif leading-relaxed text-sm">
               <div className="text-center mb-8 border-b-2 border-black pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tighter">BFI Standard Production Agreement</h2>
                  <p className="text-[10px] uppercase font-bold text-zinc-600 mt-1">Legally Binding Draft • Reference: {agreement.id}</p>
               </div>
               <div className="whitespace-pre-wrap">
                 {agreement.content}
               </div>
               <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 gap-8 text-[10px] uppercase font-bold">
                  <div>
                    <div className="h-px bg-black w-full mb-2" />
                    Producer Signature
                  </div>
                  <div>
                    <div className="h-px bg-black w-full mb-2" />
                    BFI Compliance Witness
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={onBack}
                className="w-full py-5 rounded-2xl gold-bg text-black font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                <CheckCircle size={18} />
                Add to Vault
              </button>
              <p className="text-[9px] text-zinc-600 text-center uppercase tracking-[0.2em]">
                This draft has been indexed in your Secure BFI Ledger.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgreementGenerator;