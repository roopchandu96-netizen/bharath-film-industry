import React from 'react';

export const BFILogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bfi-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C99846" />
        <stop offset="25%" stopColor="#F8DA8A" />
        <stop offset="50%" stopColor="#E4B55C" />
        <stop offset="75%" stopColor="#F8DA8A" />
        <stop offset="100%" stopColor="#9A6B29" />
      </linearGradient>
      <linearGradient id="bfi-blue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A7BA8" />
        <stop offset="50%" stopColor="#254366" />
        <stop offset="100%" stopColor="#122338" />
      </linearGradient>
      <filter id="bfi-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5"/>
      </filter>
    </defs>
    
    <g transform="translate(10, -5)" filter="url(#bfi-drop-shadow)">
      {/* Gold Arch */}
      <path d="M 40,140 L 40,70 L 25,70 Q 25,20 100,-5 Q 175,20 175,70 L 160,70 L 160,140 L 135,140 L 135,75 Q 135,35 100,5 Q 65,35 65,75 L 65,140 Z" fill="url(#bfi-gold)" />
      
      {/* Blue Arch */}
      <path d="M 65,140 L 65,75 Q 65,35 100,5 Q 135,35 135,75 L 135,140 L 115,140 L 115,80 Q 115,50 100,25 Q 85,50 85,80 L 85,140 Z" fill="url(#bfi-blue)" />
      
      {/* Lotus */}
      <g stroke="url(#bfi-gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Center Petal */}
        <path d="M 100,120 C 92,95 90,75 100,60 C 110,75 108,95 100,120 Z" />
        {/* Inner Side Petals */}
        <path d="M 100,118 C 85,108 80,90 82,75 C 92,82 98,98 100,118 Z" />
        <path d="M 100,118 C 115,108 120,90 118,75 C 108,82 102,98 100,118 Z" />
        {/* Outer Side Petals */}
        <path d="M 98,116 C 80,113 75,100 68,90 C 80,95 85,108 98,116 Z" />
        <path d="M 102,116 C 120,113 125,100 132,90 C 120,95 115,108 102,116 Z" />
        {/* Base line */}
        <path d="M 85,120 Q 100,128 115,120 Q 100,124 85,120 Z" fill="url(#bfi-gold)" stroke="none" />
      </g>
    </g>

    <text x="100" y="190" textAnchor="middle" fill="url(#bfi-gold)" style={{ fontSize: '64px', fontWeight: '900', fontFamily: 'Arial, Helvetica, sans-serif' }} filter="url(#bfi-drop-shadow)">BFI</text>
    
    <path d="M 30,205 L 170,205" stroke="url(#bfi-gold)" strokeWidth="1.5" filter="url(#bfi-drop-shadow)" />
    
    <text x="100" y="225" textAnchor="middle" fill="url(#bfi-gold)" style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '1px' }} filter="url(#bfi-drop-shadow)">BHARATH FILM INDUSTRY</text>
  </svg>
);

export const BFIWordmark: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-10 h-10 drop-shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center">
      <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bfi-gold-w" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C99846" />
            <stop offset="25%" stopColor="#F8DA8A" />
            <stop offset="50%" stopColor="#E4B55C" />
            <stop offset="75%" stopColor="#F8DA8A" />
            <stop offset="100%" stopColor="#9A6B29" />
          </linearGradient>
          <linearGradient id="bfi-blue-w" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A7BA8" />
            <stop offset="50%" stopColor="#254366" />
            <stop offset="100%" stopColor="#122338" />
          </linearGradient>
        </defs>
        <g transform="translate(10, 5) scale(0.9)">
          <path d="M 40,140 L 40,70 L 25,70 Q 25,20 100,-5 Q 175,20 175,70 L 160,70 L 160,140 L 135,140 L 135,75 Q 135,35 100,5 Q 65,35 65,75 L 65,140 Z" fill="url(#bfi-gold-w)" />
          <path d="M 65,140 L 65,75 Q 65,35 100,5 Q 135,35 135,75 L 135,140 L 115,140 L 115,80 Q 115,50 100,25 Q 85,50 85,80 L 85,140 Z" fill="url(#bfi-blue-w)" />
          <g stroke="url(#bfi-gold-w)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 100,120 C 92,95 90,75 100,60 C 110,75 108,95 100,120 Z" />
            <path d="M 100,118 C 85,108 80,90 82,75 C 92,82 98,98 100,118 Z" />
            <path d="M 100,118 C 115,108 120,90 118,75 C 108,82 102,98 100,118 Z" />
            <path d="M 98,116 C 80,113 75,100 68,90 C 80,95 85,108 98,116 Z" />
            <path d="M 102,116 C 120,113 125,100 132,90 C 120,95 115,108 102,116 Z" />
            <path d="M 85,120 Q 100,128 115,120 Q 100,124 85,120 Z" fill="url(#bfi-gold-w)" stroke="none" />
          </g>
        </g>
      </svg>
    </div>
    <div className="flex flex-col justify-center">
      <span className="font-sans font-bold text-transparent text-xl tracking-wide leading-none" style={{ backgroundImage: 'linear-gradient(to bottom right, #F8DA8A, #D4AF37)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>BFI</span>
      <span className="text-[7px] text-yellow-500 font-bold uppercase tracking-[0.15em] mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Bharath Film Industry</span>
    </div>
  </div>
);
