import React, { useState } from 'react';
import { Search, Mail, Bookmark, Star, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const MobileCastView: React.FC = () => {
  const [activeChip, setActiveChip] = useState('All Talent');

  const chips = ['All Talent', 'Actors', 'Directors', 'Cinematographers', 'Writers'];

  const risingStars = [
    {
      id: 'ishita',
      name: 'Ishita Varma',
      role: 'Method Actor',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300'
    },
    {
      id: 'aryan',
      name: 'Aryan Khanna',
      role: 'Lead Talent',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300'
    }
  ];

  const castingCalls = [
    {
      id: 'dharma',
      company: 'Dharma Productions',
      role: 'Lead Female (20-25) — Period Drama',
      location: 'Mumbai / UK',
      endsIn: 'Ends in 2d',
      budget: '₹50L - 1.2Cr',
      status: 'ACTIVE'
    },
    {
      id: 'excel',
      company: 'Excel Entertainment',
      role: 'Action Director — Streaming Series',
      location: 'Mumbai',
      endsIn: 'Ends in 7d',
      budget: '₹15L - 30L',
      status: 'ONGOING'
    }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white leading-tight font-serif">Discover Talent</h2>
        <p className="text-xs text-[#a39a88] mt-1">Connect with industry's finest creators.</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" />
        <input 
          type="text" 
          placeholder="Search actors, directors..." 
          className="w-full bg-[#16120a] border border-[#2e2617] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[#eae3d2] placeholder-[#8c826e] focus:border-amber-500 outline-none"
        />
      </div>

      {/* Filter Chips Horizontal Scrolling */}
      <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide py-1">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all active:scale-95 ${
              activeChip === chip
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md shadow-yellow-500/10'
                : 'bg-[#16120a] border border-[#2e2617] text-[#a39a88]'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Spotlight Card */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] block">Spotlight</span>
          <span className="text-[8px] font-black uppercase text-[#8c826e] tracking-widest block">Director of the Month</span>
        </div>

        <div className="bg-[#16120a] border border-[#eab308]/20 rounded-3xl overflow-hidden shadow-lg relative">
          {/* Spotlight Image Overlay */}
          <div className="h-48 relative bg-black">
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600" 
              alt="Siddharth Anand" 
              className="w-full h-full object-cover opacity-60 mix-blend-screen object-top"
            />
            {/* Dark gradient shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#16120a] via-[#16120a]/40 to-transparent" />
            
            {/* Profile Floating Details */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xl font-bold text-white leading-none font-serif">Siddharth Anand</h4>
                <CheckCircle2 size={16} className="text-yellow-500 fill-black stroke-[2.5]" />
              </div>
              <p className="text-[10px] text-[#a39a88] mt-1.5 leading-relaxed truncate">
                Master of high-octane spectacle. Known for "Fighter" and "Pathaan". Looking for fresh talent for upcoming global spy...
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 flex gap-3 border-t border-[#251f14]">
            <button className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md">
              <Mail size={14} className="stroke-[2.5]" />
              Connect
            </button>
            <button className="p-3 bg-[#0d0a06] border border-[#251f14] text-amber-500 rounded-xl active:scale-95 transition-transform">
              <Bookmark size={16} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Rising Stars Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold tracking-wide">Rising Stars</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {risingStars.map((star) => (
            <div 
              key={star.id}
              className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-4 flex flex-col items-center text-center shadow-md relative"
            >
              {/* Rating badge */}
              <span className="absolute top-3 right-3 bg-black/60 border border-[#251f14] px-1.5 py-0.5 rounded-full text-[8px] font-black text-yellow-500 flex items-center gap-0.5 shadow-sm">
                <Star size={8} className="fill-yellow-500 stroke-none" />
                {star.rating}
              </span>

              {/* Avatar circle */}
              <div 
                className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-amber-500/20 shadow-md"
                style={{ backgroundImage: `url(${star.image})` }}
              />

              <h4 className="text-sm font-bold text-white mt-4">{star.name}</h4>
              <span className="text-[9px] text-[#a39a88] font-bold uppercase tracking-wider mt-0.5 block">{star.role}</span>

              <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl mt-4 hover:from-blue-500 hover:to-blue-400 active:scale-95 transition-all shadow-md">
                Hire
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Casting Calls Section */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold tracking-wide">Casting Calls</h3>
          <button className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {castingCalls.map((call) => (
            <div 
              key={call.id}
              className="bg-[#16120a] border border-[#2e2617] rounded-3xl p-5 relative shadow-sm space-y-4"
            >
              {/* Active Badge */}
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider border ${
                  call.status === 'ACTIVE'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                    : 'bg-[#8c826e]/10 border-[#8c826e]/30 text-[#8c826e]'
                }`}>
                  {call.status}
                </span>
                <span className="text-sm font-extrabold text-amber-500 font-mono">{call.budget}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-serif">{call.company}</h4>
                <p className="text-xs text-[#a39a88] mt-1">{call.role}</p>
              </div>

              <div className="flex items-center gap-4 text-[9px] text-[#8c826e] font-black uppercase tracking-wider pt-2 border-t border-[#251f14]">
                <span className="flex items-center gap-1">
                  <MapPin size={10} className="text-amber-500" />
                  {call.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} className="text-amber-500" />
                  {call.endsIn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
