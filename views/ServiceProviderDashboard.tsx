import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Plus, Search, Scale, FileCheck, HelpCircle, PhoneCall, Briefcase } from 'lucide-react';

interface ServiceProviderDashboardProps {
  user: User;
}

const ServiceProviderDashboard: React.FC<ServiceProviderDashboardProps> = ({ user }) => {
  const [serviceCategory, setServiceCategory] = useState('Legal & Contracts');
  const [listedServices, setListedServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');

  const handleBFIContact = (personName: string, roleOrProject: string) => {
    const subject = encodeURIComponent(`Connection Request: Inquiry for ${personName} (${roleOrProject})`);
    const body = encodeURIComponent(`Hello BFI Team,\n\nI would like to contact "${personName}" (${roleOrProject}) for work-related reasons. Please help arrange this connection.\n\nThank you.`);
    
    const mailtoUrl = `mailto:bharatfilmindustry@gmail.com?subject=${subject}&body=${body}`;
    const whatsappUrl = `https://wa.me/919652919968?text=${encodeURIComponent(`Hello BFI Team, I want to connect with ${personName} (${roleOrProject}) for work. Please arrange this.`)}`;

    const choice = window.confirm(
      `To protect user privacy, direct contact is disabled. Your connection request will be routed to BFI Admin.\n\nClick OK to contact via WhatsApp, or Cancel to contact via Email.`
    );

    if (choice) {
      window.open(whatsappUrl, '_blank');
    } else {
      window.location.href = mailtoUrl;
    }
  };

  const handleListService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const newService = {
      id: String(listedServices.length + 1),
      name: newServiceName,
      category: serviceCategory,
      rating: 'New Service',
      status: 'ACTIVE'
    };
    setListedServices([...listedServices, newService]);
    alert(`Professional service "${newServiceName}" has been published to the BFI Service Network.`);
    setNewServiceName('');
  };

  const activeConsultations: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Offered Services', val: listedServices.length, icon: '💼', color: 'text-amber-500' },
          { label: 'Inquiries', val: activeConsultations.length + ' Pending', icon: '📞', color: 'text-blue-500' },
          { label: 'Trust Index', val: 'Level 4', icon: '🛡️', color: 'text-green-500' },
          { label: 'Active Contracts', val: '3 Cleared', icon: '✅', color: 'text-purple-500' }
        ].map((m, i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{m.val}</h3>
            </div>
            <span className="text-3xl">{m.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Consultations List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif text-white">Active Service Requests</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Incoming consultation tickets from active production crews</p>
            </div>

            <div className="space-y-4">
              {activeConsultations.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs border border-zinc-900 border-dashed rounded-2xl">
                  No active service requests
                </div>
              ) : (
                activeConsultations.map(ticket => (
                  <div key={ticket.id} className="p-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">{ticket.type}</h4>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{ticket.production}</p>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">From: {ticket.contact}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{ticket.desc}</p>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleBFIContact(ticket.contact, `Client of ${ticket.production}`)}
                        className="px-5 py-2 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-1.5"
                      >
                        <PhoneCall size={12} /> Contact BFI for Connection
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* List Service Form */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif text-white">Offer Professional Service</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Publish service to directors &amp; producers</p>
            </div>

            <form onSubmit={handleListService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Service Title</label>
                <input required value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white font-bold" placeholder="e.g. Movie PR &amp; Influencer Marketing" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Service Category</label>
                <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-amber-500 outline-none text-white">
                  <option>Legal &amp; Contracts</option>
                  <option>Accounting/Tax</option>
                  <option>Production Insurance</option>
                  <option>Marketing &amp; PR</option>
                  <option>Distribution Advisory</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2">
                Publish Service
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
