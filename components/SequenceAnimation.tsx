import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';

const SequenceAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(1);
  const totalFrames = 50;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // 24 frames per second
  const fps = 24;
  const frameInterval = 1000 / fps;

  useEffect(() => {
    let active = true;
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameStr = String(i).padStart(3, '0');
      img.src = `/animation/ezgif-frame-${frameStr}.jpg`;
      img.onload = () => {
        if (!active) return;
        count++;
        setLoadedCount(count);
        if (count === totalFrames) {
          setLoading(false);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${frameStr}`);
        if (!active) return;
        count++;
        setLoadedCount(count);
        if (count === totalFrames) {
          setLoading(false);
        }
      };
      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;

    return () => {
      active = false;
    };
  }, []);

  // Frame tick animation loop
  useEffect(() => {
    if (loading || !isPlaying) return;

    let animationFrameId: number;

    const render = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const elapsed = time - lastTimeRef.current;

      if (elapsed >= frameInterval) {
        const framesToAdvance = Math.floor(elapsed / frameInterval);
        frameIndexRef.current = (frameIndexRef.current + framesToAdvance) % totalFrames;
        lastTimeRef.current = time - (elapsed % frameInterval);
        setCurrentFrame(frameIndexRef.current + 1);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imagesRef.current[frameIndexRef.current];

        if (canvas && ctx && img && img.complete) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading, isPlaying, frameInterval]);

  // Adjust canvas drawing size
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1920;
    canvas.height = 1080;

    // Draw initial frame
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndexRef.current];
    if (ctx && img && img.complete) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [loading]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    lastTimeRef.current = 0; // Reset timer ref
  };

  const restartAnimation = () => {
    frameIndexRef.current = 0;
    setCurrentFrame(1);
    lastTimeRef.current = 0;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[0];
    if (canvas && ctx && img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-8 group">
      {/* Premium glow effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
      
      {/* Outer Card container */}
      <div className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden border border-slate-800 bg-[#020617] shadow-2xl flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-6 text-center px-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
              <span className="absolute text-[10px] font-black text-amber-500 uppercase tracking-wider">BFI</span>
            </div>
            <div className="space-y-2">
              <div className="text-white text-sm font-bold tracking-widest uppercase font-mono">
                Initiating Cinematic Sequence
              </div>
              <div className="text-slate-500 text-xs font-mono">
                Buffered {loadedCount} of {totalFrames} frames
              </div>
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${(loadedCount / totalFrames) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient for Cinema look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Cinema play controls that overlay on hover */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-3 bg-black/60 hover:bg-amber-500 text-white hover:text-black rounded-full backdrop-blur-md border border-slate-700/50 hover:border-amber-400 transition-all shadow-lg active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button
                  onClick={restartAnimation}
                  className="p-3 bg-black/60 hover:bg-slate-800 text-white rounded-full backdrop-blur-md border border-slate-700/50 transition-all shadow-lg active:scale-95"
                  title="Restart"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 text-[10px] font-mono tracking-widest text-slate-300 uppercase">
                Frame {String(currentFrame).padStart(2, '0')} / {totalFrames}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SequenceAnimation;
