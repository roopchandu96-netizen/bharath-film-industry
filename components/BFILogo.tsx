import React from 'react';

export const BFILogo: React.FC<{ className?: string }> = ({ className }) => (
  <img src="/logo.jpg" alt="BFI Logo" className={`object-contain ${className || ''}`} />
);

export const BFIWordmark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center ${className || ''}`}>
    <img src="/logo.jpg" alt="BFI Logo" className="w-auto h-full max-h-12 object-contain" />
  </div>
);
