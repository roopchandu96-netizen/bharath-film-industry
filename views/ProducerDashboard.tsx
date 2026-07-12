import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Plus, Search, DollarSign, Activity, FileText, Send, Users, Film, Clock, MessageSquare } from 'lucide-react';

interface ProducerDashboardProps {
  user: User;
}

const ProducerDashboard: React.FC<ProducerDashboardProps> = ({ user }) => {
  const [activeView, setActiveView] = useState('overview');
  
  // Budget Planning State
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Pre-Production');
  const [itemCost, setItemCost] = useState(500000);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  // Production Tracking State
  const [milestones, setMilestones] = useState<any[]>([]);

  // Investor Communications State
  const [chatMessage, setChatMessage] = useState('');
  const [investorMessages, setInvestorMessages] = useState<any[]>([]);

  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: String(budgetItems.length + 1),
      name: itemName,
      category: itemCategory,
      cost: itemCost
    };
    setBudgetItems([newItem, ...budgetItems]);
    alert(`${itemName} added to the budget estimate.`);
    setItemName('');
    setItemCost(100000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMsg = {
      id: String(investorMessages.length + 1),
      sender: user.name || 'Producer (You)',
      text: chatMessage,
      time: 'Just now'
    };
    setInvestorMessages([...investorMessages, newMsg]);
    setChatMessage('');
  };

  const totalAllocatedBudget = budgetItems.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-slate-200">
      {/* Navigation Sub-menu */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'budget', label: 'Budget Planner', icon: '💰' },
          { id: 'tracking', label: 'Production Track', icon: '🎬' },
          { id: 'investor_chat', label: 'Investor Room', icon: '💬' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              activeView === tab.id
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Productions', val: '0 Projects', icon: <Film className="text-amber-500" />, color: 'bg-amber-500/10' },
              { label: 'Allocated Budget', val: `₹${(totalAllocatedBudget / 100000).toFixed(0)}L`, icon: <DollarSign className="text-green-500" />, color: 'bg-green-500/10' },
              { label: 'Milestones Achieved', val: '0 / 0 Complete', icon: <Activity className="text-blue-500" />, color: 'bg-blue-500/10' },
              { label: 'Connected Investors', val: '0 Active', icon: <Users className="text-purple-500" />, color: 'bg-purple-500/10' }
            ].map((m, i) => (
              <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{m.label}</p>
                  <h3 className="text-2xl font-black text-white mt-1">{m.val}</h3>
                </div>
                <span className={`p-3 rounded-2xl ${m.color}`}>{m.icon}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
              <h3 className="text-lg font-serif text-white">Producer Action Hub</h3>
              <p className="text-slate-400 text-sm">
                Welcome to the BFI Producer Console. Track pre-production scheduling, coordinate budget limits, and verify transparency metrics directly to your capital partners and node syndicates.
              </p>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 text-yellow-500/80 text-[11px] leading-relaxed">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Compliant Production Lock:</strong>
                  Your current project requires all SWA licenses to be registered on-chain before the second funding tranche can be released by admin nodes.
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest text-zinc-400">Quick Stats</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Schedule Completion</span>
                    <span className="text-white">25%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Budget Spent</span>
                    <span className="text-white">₹1.4Cr / ₹5Cr</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif text-white">Line Item Budgets</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Detailed production cost estimations</p>
              </div>
              <span className="text-yellow-500 font-mono text-sm font-bold">Total: ₹{(totalAllocatedBudget / 100000).toFixed(0)}L</span>
            </div>

            <div className="space-y-4">
              {budgetItems.map(item => (
                <div key={item.id} className="p-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-yellow-500/10 text-yellow-500 rounded"><FileText size={12} /></span>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500">{item.category}</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-500 font-mono">₹{item.cost.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-850 rounded-[2.5rem] p-8 space-y-6">
            <div>
              <h3 className="text-lg font-serif text-white">Add Budget Item</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Track cost nodes</p>
            </div>

            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Item Description</label>
                <input required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-yellow-500 outline-none text-white" placeholder="e.g. Set Design & Art Materials" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Phase</label>
                <select value={itemCategory} onChange={e => setItemCategory(e.target.value)} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-yellow-500 outline-none text-white">
                  <option>Pre-Production</option>
                  <option>Production</option>
                  <option>Post-Production</option>
                  <option>Marketing & PR</option>
                  <option>Distribution Costs</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Estimated Cost (INR)</label>
                <input required type="number" value={itemCost} onChange={e => setItemCost(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-yellow-500 outline-none text-white font-mono" />
              </div>

              <button type="submit" className="w-full py-3.5 bg-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-yellow-400 transition-all">
                Append Line Cost
              </button>
            </form>
          </div>
        </div>
      )}

      {activeView === 'tracking' && (
        <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
          <div>
            <h3 className="text-xl font-serif text-white">Production Milestones</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Production status and delivery tracking</p>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
            {milestones.map(m => (
              <div key={m.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-[#0f172a] flex items-center justify-center ${
                  m.status === 'COMPLETED' ? 'bg-green-500' : m.status === 'IN_PROGRESS' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-800'
                }`} />
                
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.title}</h4>
                    <p className="text-[9px] font-mono text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock size={10} /> Deadline: {m.date}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                    m.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : m.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'investor_chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 flex flex-col h-[500px]">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-yellow-500" /> BFI Syndicate Communication Node
              </h3>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-0.5">Encrypted room for investors &amp; production leads</p>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-hide">
              {investorMessages.map(msg => (
                <div key={msg.id} className={`p-4 rounded-2xl border text-xs max-w-[85%] ${
                  msg.sender.includes('Producer')
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-slate-200 ml-auto'
                    : 'bg-zinc-950/60 border-zinc-900 text-slate-300'
                }`}>
                  <div className="flex justify-between items-center gap-4 mb-1">
                    <strong className="text-yellow-500 text-[10px] uppercase font-bold">{msg.sender}</strong>
                    <span className="text-[8px] font-mono text-zinc-500">{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                required
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-xs focus:border-yellow-500 outline-none text-white"
                placeholder="Broadcast a secure update message..."
              />
              <button type="submit" className="p-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-all">
                <Send size={14} />
              </button>
            </form>
          </div>

          <div className="bg-slate-900/30 border border-slate-850 rounded-[2rem] p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Escrow Tranche Progress</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Released capital schedule</p>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Initial Advance (Script development)', amt: '₹15L', status: 'RELEASED' },
                { name: 'Schedule 1 Shooting Tranche', amt: '₹50L', status: 'RELEASED' },
                { name: 'Schedule 2 Shoot & Post-production', amt: '₹85L', status: 'LOCKED' }
              ].map((tranche, i) => (
                <div key={i} className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{tranche.name}</h5>
                    <span className="text-yellow-500 font-mono text-[10px]">{tranche.amt}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                    tranche.status === 'RELEASED' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {tranche.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerDashboard;
