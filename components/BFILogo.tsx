import React from 'react';

export const BFILogo: React.FC<{ className?: string }> = ({ className }) => (
  <img src="/logo.jpg" alt="BFI Logo" className={`object-contain ${className || ''}`} />
);

export const BFIWordmark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className || ''}`}>
    <img src="/logo.jpg" alt="BFI Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
    <div className="flex flex-col text-left">
      <h1 className="text-xl font-bold text-white leading-none tracking-tight">Bharat <span className="text-yellow-500">Film Industry™</span></h1>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Decentralized Production</p>
    </div>
  </div>
);
