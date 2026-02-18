import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, User, Bot, Loader2, 
  TrendingUp, ShieldCheck, Info, ChevronDown, Trash2, Clock
} from 'lucide-react';
import { BFIChatService } from '../services/chatService.ts';
import { auth } from '../services/firebase.ts';

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
}

const BFIIntellect: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatServiceRef = useRef<BFIChatService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (isOpen && user && !chatServiceRef.current) {
      chatServiceRef.current = new BFIChatService(user.id);
      chatServiceRef.current.getChatHistory((history) => {
        setMessages(history);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isTyping) return;

    setInput('');
    setIsTyping(true);

    if (chatServiceRef.current) {
      await chatServiceRef.current.sendMessage(messageText);
    }
    setIsTyping(false);
  };

  const handleClear = async () => {
    if (window.confirm("CRITICAL: Wipe BFI Intellect conversation ledger?") && chatServiceRef.current) {
      await chatServiceRef.current.clearHistory();
      setMessages([]);
    }
  };

  const suggestions = [
    "Analyze Samrat ROI",
    "Syndicate Benefits?",
    "Smart Agreement Help",
    "Market Outlook 2025"
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[100] w-14 h-14 rounded-full gold-bg flex items-center justify-center text-black shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:scale-110 active:scale-90 transition-all group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[110] sm:inset-auto sm:right-6 sm:bottom-24 sm:w-[400px] h-[600px] bg-black/95 backdrop-blur-3xl border border-zinc-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between gold-bg/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl gold-bg flex items-center justify-center text-black shadow-lg">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">BFI Intellect</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Gemini 3 Engine Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={handleClear} 
            title="Clear History"
            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 grayscale">
            <Bot size={48} strokeWidth={1} />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest">Awaiting Consultation</p>
              <p className="text-[10px] uppercase tracking-tighter">Your BFI Intellect Advisor is ready.</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
              msg.role === 'model' 
                ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-lg ${
              msg.role === 'model' 
                ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-none' 
                : 'gold-bg text-black font-bold rounded-tr-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5 py-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length < 5 && (
        <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.map(s => (
            <button 
              key={s} 
              onClick={() => handleSend(s)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:border-yellow-400/50 hover:text-yellow-400 transition-all active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query BFI Intellect..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-5 pr-12 text-xs focus:outline-none focus:border-yellow-400 transition-all placeholder:text-zinc-700"
            />
          </div>
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-4 rounded-2xl gold-bg text-black shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <ShieldCheck size={10} className="text-yellow-400" /> Secure Vault
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <TrendingUp size={10} className="text-yellow-400" /> Market Intelligence
          </div>
        </div>
      </div>
    </div>
  );
};

export default BFIIntellect;