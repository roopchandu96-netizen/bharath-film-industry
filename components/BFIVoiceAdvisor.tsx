
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Waves, X, Loader2, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { encodeAudio, decodeAudio, decodeAudioData, createPcmBlob } from '../services/liveService.ts';

const BFIVoiceAdvisor: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>('Establish Audio Link');
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startVoiceSession = async () => {
    setIsConnecting(true);
    setStatus('Linking BFI Intellect...');
    
    try {
      // Fixed: Obtained API key directly from process.env.API_KEY as per guidelines
      // Creating a new instance ensures it uses the most up-to-date key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('Secure Audio Bridge Active');
            
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioCtxRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
              const buffer = await decodeAudioData(decodeAudio(base64Audio), outputAudioCtxRef.current, 24000, 1);
              const source = outputAudioCtxRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioCtxRef.current.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => cleanup(),
          onerror: (e) => {
            console.error("Audio Bridge Error:", e);
            cleanup();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are BFI Intellect, the elite financial advisor for the Bharath Film Industry. Provide sharp, professional investment advice regarding Pan-India movie projects. Speak with institutional authority.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Audio session failure:", err);
      setIsConnecting(false);
      setStatus('Bridge Failure');
    }
  };

  const cleanup = () => {
    setIsActive(false);
    setIsConnecting(false);
    setStatus('Link Terminated');
    streamRef.current?.getTracks().forEach(t => t.stop());
    inputAudioCtxRef.current?.close();
    outputAudioCtxRef.current?.close();
    sessionRef.current?.close();
  };

  useEffect(() => {
    if (isOpen) {
      // Auto-start on open for better UX
      startVoiceSession();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-lg bg-zinc-950 border border-yellow-400/20 rounded-[3.5rem] p-12 text-center space-y-12 relative overflow-hidden shadow-[0_0_100px_rgba(250,204,21,0.1)]">
        <button onClick={onClose} className="absolute top-8 right-8 p-4 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all">
          <X size={24} />
        </button>

        <div className="space-y-4">
          <div className="w-16 h-16 rounded-[1.5rem] gold-bg flex items-center justify-center text-black mx-auto shadow-2xl">
            <Volume2 size={32} />
          </div>
          <h2 className="text-3xl font-serif gold-gradient">BFI Audio Bridge</h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-800'}`} />
            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em]">{status}</p>
          </div>
        </div>

        <div className="h-32 flex items-center justify-center gap-1.5">
          {isActive ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-yellow-400 rounded-full animate-wave" 
                style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }} 
              />
            ))
          ) : (
            <div className="w-full h-px bg-zinc-900" />
          )}
        </div>

        <div className="space-y-6">
          <button 
            onClick={isActive ? cleanup : startVoiceSession}
            disabled={isConnecting}
            className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
              isActive ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
            }`}
          >
            {isConnecting ? <Loader2 className="animate-spin" size={20} /> : isActive ? <><MicOff size={20} /> Disconnect</> : <><Mic size={20} /> Initialize advisor</>}
          </button>

          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
              <ShieldCheck size={12} className="text-yellow-400" /> Encrypted Link
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
              <Zap size={12} className="text-yellow-400" /> Low Latency
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes wave { 0%, 100% { transform: scaleY(0.6); } 50% { transform: scaleY(1.4); } }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BFIVoiceAdvisor;
