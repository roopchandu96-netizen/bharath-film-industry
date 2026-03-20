import React, { useState } from 'react';
import { Home, Briefcase, User as UserIcon, ShieldCheck, LogOut, TrendingUp, Menu, X, LucideIcon, Info } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../services/firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
}

import { BFILogo } from './BFILogo';

const MarketTicker: React.FC = () => {
  const events = [
    "SYNOPSIS-402: ₹5.2Cr deployed",
    "GENRE WATCH: Action Thrillers Up 12%",
    "NEW NODE: Director 'S. Raj' listed synopsis",
    "LIQUIDITY: ₹240Cr Market Cap reached",
    "BFI SECURE: 100% Audit Complete",
    "TRENDING: Pan-India Sci-Fi demand surges"
  ];

  return (
    <div className="w-full bg-[#020617] border-b border-white/5 py-1.5 overflow-hidden whitespace-nowrap z-50">
      <div className="inline-block animate-ticker">
        {events.map((e, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-10 text-[10px] font-bold uppercase text-yellow-500/80">
            <TrendingUp size={10} className="text-yellow-500" /> {e}
          </span>
        ))}
        {events.map((e, i) => (
          <span key={'r' + i} className="inline-flex items-center gap-2 mx-10 text-[10px] font-bold uppercase text-yellow-500/80">
            <TrendingUp size={10} className="text-yellow-500" /> {e}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-block;
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: string; label: string; icon: LucideIcon }[] = [];
  if (role === UserRole.DIRECTOR) {
    navItems.push(
      { id: 'explore', label: 'Explore', icon: Home },
      { id: 'portfolio', label: 'My Studio', icon: Briefcase },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'about', label: 'About', icon: Info }
    );
  } else if (role === UserRole.ADMIN) {
    navItems.push(
      { id: 'explore', label: 'Marketplace', icon: Home },
      { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'about', label: 'About', icon: Info }
    );
  } else {
    navItems.push(
      { id: 'explore', label: 'Explore', icon: Home },
      { id: 'portfolio', label: 'My Investments', icon: Briefcase },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'about', label: 'About', icon: Info }
    );
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      supabase.auth.signOut().finally(() => {
        localStorage.clear();
        window.location.reload();
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-yellow-500/30 flex flex-col">
      <MarketTicker />

      {/* MAIN WEBSITE HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('explore')}>
            <div className="w-10 h-10 flex items-center justify-center">
              <BFILogo className="w-full h-full drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">Bharath <span className="text-yellow-500">Film Industry</span></h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Decentralized Production</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-full border border-slate-800">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === item.id
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 transform scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
              <LogOut size={14} />
              LOGOUT
            </button>
            <button className="md:hidden p-2 text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#0f172a] pt-28 px-6 animate-in slide-in-from-top-10 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold border ${activeTab === item.id
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400'
                  }`}
              >
                <item.icon size={24} />
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-xl text-lg font-bold border border-red-500/30 bg-red-500/10 text-red-500 mt-4">
              <LogOut size={24} />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <BFILogo className="w-12 h-12 grayscale opacity-50" />
            <p className="text-slate-500 text-sm leading-relaxed">
              The world's first decentralized film finance ecosystem, empowering directors and investors through transparent blockchain governance.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Marketplace</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Studio Tools</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Tokenomics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-500 transition-colors">Risk Disclosure</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Connect</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-yellow-500 hover:text-black transition-colors cursor-pointer">X</div>
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-yellow-500 hover:text-black transition-colors cursor-pointer">In</div>
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:bg-yellow-500 hover:text-black transition-colors cursor-pointer">Ig</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
          © 2026 Bharath Film Industry. All rights reserved. Built on Secured Nodes.
        </div>
      </footer>
    </div>
  );
};

export default Layout;