import React, { useState } from 'react';
import { ArrowLeft, Video, Paperclip, Send, Plus, Search, FileText, Check } from 'lucide-react';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export const MobileMessagesView: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null); // null means chat list, 'vikram' means Vikram Sethi chat
  const [activeTab, setActiveTab] = useState('All Chats');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'me',
      text: 'Here is the draft. It includes the 15% backend royalty as discussed.',
      timestamp: '14:18',
      attachment: {
        name: 'Dharma_Contract_V2.pdf',
        size: '2.4 MB',
        type: 'pdf'
      }
    },
    {
      id: 'm2',
      sender: 'other',
      text: "The smart contract is ready for review. I'll take a look and get back to you by EOD. Shall we jump on a quick video call tomorrow morning?",
      timestamp: '14:20'
    }
  ]);

  const tabs = ['All Chats', 'Investors', 'Cast & Crew', 'Producers'];

  const chatThreads = [
    {
      id: 'vikram',
      name: 'Vikram Sethi',
      role: 'Director',
      lastMessage: 'The smart contract is ready for revie...',
      time: '14:20',
      online: true,
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200'
    },
    {
      id: 'ananya',
      name: 'Ananya Rao',
      role: 'Producer',
      lastMessage: 'Attached the revised script for Scene ...',
      time: 'Yesterday',
      online: false,
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200'
    },
    {
      id: 'alphasquad',
      name: 'Alpha Squad Production',
      role: 'Production House',
      lastMessage: 'Directorial briefing scheduled for Mon...',
      time: 'Wed',
      online: false,
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=200'
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  // If a chat is active, show the Chat Room View
  if (activeChat === 'vikram') {
    return (
      <div className="flex flex-col h-[calc(100vh-12.5rem)] bg-[#021f18] relative rounded-3xl overflow-hidden border border-yellow-500/10 p-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/10 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveChat(null)}
              className="p-1 text-[#FACC15] hover:text-white active:scale-90 transition-transform bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft size={20} className="stroke-[2.5]" />
            </button>
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center border border-yellow-500/20"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200')" }}
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#021f18] absolute bottom-0 right-0 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-bold text-white leading-none">Vikram Sethi</h3>
              </div>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-1 block">Secure Escrow Chat Active</span>
            </div>
          </div>

          <button className="p-2 bg-emerald-950 border border-yellow-500/10 text-[#FACC15] rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer">
            <Video size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Messages list viewport */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Bubble Container */}
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] font-bold rounded-tr-none'
                      : 'bg-emerald-950/40 border border-yellow-500/10 backdrop-blur-xl text-[#FFFBEB] rounded-tl-none'
                  }`}
                >
                  {/* Message body */}
                  <p>{msg.text}</p>

                  {/* Attachment card if exists */}
                  {msg.attachment && (
                    <div className="bg-black/25 border border-black/10 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-black/40 rounded-lg flex items-center justify-center text-[#FACC15]">
                        <FileText size={18} className="stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">{msg.attachment.name}</p>
                        <span className="text-[8px] text-[#FFFBEB]/60 font-black uppercase mt-0.5 block">{msg.attachment.size}</span>
                      </div>
                      <div className="text-[8px] font-bold bg-[#0d0a06]/10 text-[#FACC15] px-1.5 py-0.5 rounded border border-yellow-500/15 flex items-center gap-0.5">
                        <Check size={8} />
                        VERIFIED
                      </div>
                    </div>
                  )}
                </div>
                {/* Timestamp */}
                <span className="text-[8px] text-emerald-400/60 font-bold uppercase tracking-wider mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Input Message Area */}
        <div className="pt-4 border-t border-yellow-500/5 bg-[#021f18] flex items-center gap-3">
          <button className="p-3 bg-emerald-950/60 border border-yellow-500/10 text-[#FACC15] rounded-xl active:scale-95 transition-transform cursor-pointer">
            <Plus size={16} className="stroke-[2.5]" />
          </button>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..." 
              className="w-full bg-emerald-950/60 border border-yellow-500/10 rounded-2xl py-3 px-4 pr-10 text-xs text-white placeholder-emerald-800/60 focus:border-[#FACC15] outline-none"
            />
            <button 
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] rounded-xl active:scale-90 transition-transform cursor-pointer"
            >
              <Send size={12} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the Chat List screen
  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white leading-none font-serif">Messages</h2>
        </div>
        {/* Right side floating icons */}
        <div className="flex items-center gap-2">
          <button className="p-2 bg-emerald-950 border border-yellow-500/10 text-[#FACC15] rounded-xl cursor-pointer">
            <Video size={16} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-hide py-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all active:scale-95 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#FACC15] via-[#eab308] to-[#f59e0b] text-[#021f18] shadow-md shadow-yellow-500/10'
                : 'bg-emerald-950/40 border border-yellow-500/10 text-emerald-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat Thread List */}
      <div className="space-y-3">
        {chatThreads.map((chat) => (
          <div
            key={chat.id}
            onClick={() => chat.id === 'vikram' && setActiveChat('vikram')}
            className={`bg-emerald-950/40 border border-yellow-500/10 rounded-[1.8rem] p-4 flex items-center gap-4 cursor-pointer hover:border-yellow-500/20 active:scale-[0.99] transition-all shadow-sm ${
              chat.id === 'vikram' ? 'border-[#FACC15]/30 ring-1 ring-[#FACC15]/20' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div 
                className="w-12 h-12 rounded-full bg-cover bg-center border border-yellow-500/10"
                style={{ backgroundImage: `url(${chat.avatar})` }}
              />
              {chat.online && (
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-[#021f18] absolute bottom-0 right-0 animate-pulse" />
              )}
            </div>

            {/* Chat content snippet */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-sm font-bold text-white truncate">{chat.name}</h4>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{chat.time}</span>
              </div>
              <p className="text-xs text-emerald-400/80 truncate mt-1">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
