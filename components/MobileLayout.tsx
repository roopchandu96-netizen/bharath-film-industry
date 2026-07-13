import React from 'react';
import { Home, Compass, DollarSign, Users, MessageSquare, User, Bell, Search, Plus, Info, Film, Ticket } from 'lucide-react';
import { UserRole } from '../types';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  onOpenSubmission?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  role,
  userName,
  onOpenSubmission
}) => {
  const rawTabs = role === UserRole.ADMIN ? [
    { id: 'home', label: 'Oversight', icon: Home },
    { id: 'booking', label: 'Booking', icon: Film },
    { id: 'discover', label: 'Approval', icon: Compass },
    { id: 'invest', label: 'Treasury', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about', label: 'About', icon: Info }
  ] : role === UserRole.MOVIE_LOVER ? [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'booking', label: 'Book Tickets', icon: Film },
    { id: 'invest', label: 'My Tickets', icon: Ticket },
    { id: 'profile', label: 'Profile', icon: User }
  ] : [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'booking', label: 'Booking', icon: Film },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'invest', label: 'Invest', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about', label: 'About', icon: Info }
  ];

  const tabs = rawTabs.filter(t => {
    if (t.id === 'discover' && role !== UserRole.ADMIN && role !== UserRole.INVESTOR && role !== UserRole.DIRECTOR) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021f18] via-[#064E3B] to-[#021f18] text-[#FFFBEB] font-sans flex flex-col overflow-x-hidden selection:bg-[#FACC15]/20 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] relative">
      {/* Top Mobile Header */}
      <header className="sticky top-0 z-50 bg-[#021f18]/90 backdrop-blur-md border-b border-yellow-500/10 px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Profile Circle (Avatar Shortcut to Profile tab) */}
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FACC15] to-[#eab308] border border-[#FACC15]/30 overflow-hidden flex items-center justify-center font-black text-emerald-950 text-xs shadow-[0_0_10px_rgba(250,204,21,0.2)] cursor-pointer active:scale-90 transition-transform"
          >
            {userName ? userName.slice(0, 2).toUpperCase() : 'BFI'}
          </button>
          
          {/* Logo Title */}
          <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-[#FACC15] to-[#fffbeb] bg-clip-text text-transparent drop-shadow-sm font-serif">
            {role === UserRole.ADMIN ? 'BFI CONTROL' : 'BFI'}
          </span>

          {role === UserRole.ADMIN && (
            <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5 text-[8px] font-black uppercase text-blue-400 tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Health
            </span>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4 text-[#FACC15]">
          <button className="p-1 hover:text-white active:scale-90 transition-transform" aria-label="Notifications">
            <Bell size={18} className="stroke-[2.5]" />
          </button>
          <button className="p-1 hover:text-white active:scale-90 transition-transform" aria-label="Search">
            <Search size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 w-full px-4 py-4 animate-in fade-in duration-300">
        {children}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#021f18]/95 backdrop-blur-xl border-t border-yellow-500/10 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex justify-between items-center shadow-[0_-10px_35px_rgba(0,0,0,0.9)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 cursor-pointer bg-transparent border-none"
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'text-[#021f18] bg-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                    : 'text-[#FACC15]/50 hover:text-[#FACC15]/80'
                }`}
              >
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-wider mt-1 transition-all ${
                  isActive ? 'text-[#FACC15] scale-105' : 'text-[#8f9b88]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
