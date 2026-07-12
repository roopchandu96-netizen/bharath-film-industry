import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { BFILogo } from './BFILogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught runtime error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    if (window.confirm("This will clear your local simulation session cache. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
          {/* Ambient cinematic glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-md w-full bg-slate-950/80 border border-slate-900 rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BFILogo className="w-6 h-6" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black font-mono">BFI SECURE NODE</span>
              </div>
              <h2 className="text-xl font-serif text-white font-black tracking-tight">Portal Display Interrupted</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected component rendering drift occurred. The system successfully contained the exception.
              </p>
            </div>

            {/* Error console log output */}
            <div className="p-4 bg-black/90 border border-slate-900 rounded-2xl text-left text-[9px] font-mono text-red-400 overflow-x-auto max-h-[120px] space-y-1 w-full">
              <span className="text-zinc-600 block">// RUNTIME EXCEPTION LOG:</span>
              <p className="font-bold">{this.state.error?.name}: {this.state.error?.message}</p>
              {this.state.error?.stack && (
                <pre className="text-zinc-500 whitespace-pre-wrap leading-normal mt-2 select-text">
                  {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
              >
                <RefreshCw size={14} className="animate-spin" /> Reload Portal
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="flex-1 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Reset Session Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
