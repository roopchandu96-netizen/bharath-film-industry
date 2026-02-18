import React, { useEffect, useRef, useState } from 'react';
import { Camera, ShieldCheck, Loader2, AlertCircle, Upload, FileCheck, ChevronLeft, CheckCircle } from 'lucide-react';

interface KYCViewProps {
  onComplete: () => void;
  onCancel: () => void;
  role: string;
}

const KYCView: React.FC<KYCViewProps> = ({ onComplete, onCancel, role }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [method, setMethod] = useState<'IDLE' | 'CAMERA' | 'UPLOAD'>('IDLE');
  const [status, setStatus] = useState<'IDLE' | 'STARTING' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const startCamera = async () => {
    setMethod('CAMERA');
    setStatus('STARTING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('SCANNING');
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus('ERROR');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMethod('UPLOAD');
      setStatus('SCANNING');
    }
  };

  useEffect(() => {
    if (status === 'SCANNING') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('SUCCESS');
            setTimeout(onComplete, 1500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-serif gold-gradient">BFI Association</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Official Identity Verification</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-sm mx-auto w-full">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 mx-auto mb-2">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-white">Join the Association</h3>
          <p className="text-zinc-500 text-xs px-4 leading-relaxed">
            Verify your government identity to be recognized as an official BFI {role === 'INVESTOR' ? 'Producer' : 'Director'}.
          </p>
        </div>

        <div className="relative w-full aspect-square max-w-[280px]">
          {/* Main Visual Area */}
          <div className={`absolute inset-0 rounded-[2.5rem] border-4 overflow-hidden z-10 transition-colors ${
            status === 'SUCCESS' ? 'border-green-500' : 'border-zinc-800'
          }`}>
            {status === 'IDLE' || status === 'ERROR' ? (
              <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center p-8 space-y-4">
                {status === 'ERROR' ? (
                  <>
                    <AlertCircle className="text-red-500" size={48} />
                    <p className="text-[10px] text-red-400 text-center uppercase font-bold">Verification Error</p>
                  </>
                ) : (
                  <>
                    <FileCheck className="text-zinc-700" size={64} strokeWidth={1} />
                    <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest leading-loose">
                      Awaiting Document<br/>or Biometric Scan
                    </p>
                  </>
                )}
              </div>
            ) : method === 'CAMERA' ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover grayscale brightness-125"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-8 space-y-4">
                 <div className="w-20 h-20 rounded-2xl bg-yellow-400/5 border border-yellow-400/10 flex items-center justify-center text-yellow-400">
                    <Upload size={32} className={status === 'SCANNING' ? 'animate-bounce' : ''} />
                 </div>
                 <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest truncate w-full px-4">
                   {selectedFile?.name || 'Document Detected'}
                 </p>
              </div>
            )}

            {/* Scanning Line Overlay */}
            {status === 'SCANNING' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                <div 
                  className="w-full h-1 gold-bg shadow-[0_0_15px_rgba(250,204,21,0.8)] absolute"
                  style={{ top: `${progress}%`, transition: 'top 50ms linear' }}
                />
              </div>
            )}
          </div>

          {/* Success Overlay */}
          {status === 'SUCCESS' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-[2.5rem] animate-in zoom-in duration-300">
              <div className="text-center space-y-2">
                <CheckCircle className="text-green-500 mx-auto" size={64} />
                <p className="text-sm font-black text-green-500 uppercase tracking-[0.2em]">Verified</p>
              </div>
            </div>
          )}
        </div>

        {status === 'IDLE' && (
          <div className="w-full space-y-3">
            <button 
              onClick={startCamera}
              className="w-full py-5 gold-bg text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-yellow-400/10 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Camera size={18} />
              Biometric Scan
            </button>
            
            <label className="block">
              <div className="w-full py-5 bg-zinc-900 border border-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl cursor-pointer hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                <Upload size={18} className="text-yellow-400" />
                Upload Gov ID
              </div>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {status === 'SCANNING' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-yellow-400" size={24} />
            <div className="text-center">
              <span className="text-[10px] font-black text-yellow-400 tracking-[0.3em] uppercase block mb-1">
                Authenticating {method === 'CAMERA' ? 'Biometrics' : 'Document'}...
              </span>
              <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden mx-auto">
                <div className="h-full gold-bg" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        {status === 'ERROR' && (
          <button onClick={() => setStatus('IDLE')} className="text-yellow-400 underline text-[10px] font-black uppercase tracking-widest">
            Try Again
          </button>
        )}
      </div>
      
      <div className="mt-auto py-8 text-center space-y-4">
        <div className="flex justify-center gap-4 opacity-30 grayscale">
           <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_SEBI.png" alt="SEBI" className="h-6 object-contain" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/bb/Digital_India_logo.svg" alt="Digital India" className="h-6 object-contain" />
        </div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1">
          <ShieldCheck size={10} /> Powered by BFI SecureID • 256-bit Encryption
        </p>
      </div>
    </div>
  );
};

export default KYCView;