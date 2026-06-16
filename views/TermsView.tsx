import React, { useState } from 'react';
import { Shield, Coins, Film, FileText, CheckCircle2, AlertTriangle, Sparkles, Scale, BookOpen } from 'lucide-react';

const TermsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'investors' | 'directors'>('investors');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700 text-slate-200">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-widest">
          <Shield size={12} /> BFI Governance
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Terms & <span className="text-yellow-500 italic">Conditions</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Please review the official rules, regulations, and risk disclosures governing the Bharath Film Industry ecosystem.
        </p>
      </div>

      {/* 1. Platform Role (Common Header Card) */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/5 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />
        <div className="bg-zinc-950/80 border border-slate-800/80 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl">
              <Scale size={24} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Clause 1</p>
              <h2 className="text-xl md:text-2xl font-serif text-white">Platform Role</h2>
            </div>
          </div>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Bharat Film Industry (BFI) acts as a facilitator connecting investors, filmmakers, directors, producers, and film projects. 
            <strong> BFI does not guarantee the commercial success of any film project.</strong>
          </p>
        </div>
      </div>

      {/* Interactive Tabs Section */}
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/80 max-w-md mx-auto">
          <button
            onClick={() => setActiveSubTab('investors')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === 'investors'
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins size={14} />
            For Investors
          </button>
          <button
            onClick={() => setActiveSubTab('directors')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === 'directors'
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film size={14} />
            For Directors
          </button>
        </div>

        {/* Tab Contents */}
        {activeSubTab === 'investors' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Clause 2 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Communication Policy</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  All communications regarding film projects, investments, agreements, budgets, and returns must be conducted exclusively through the BFI team.
                </p>
                <p className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400/90 text-xs font-medium">
                  <strong>STRICTLY PROHIBITED:</strong> Investors are strictly prohibited from directly negotiating, funding, or entering into separate agreements with directors, writers, producers, or project representatives outside the BFI platform.
                </p>
                <p>
                  Any violation may result in termination of investor participation and cancellation of associated benefits.
                </p>
              </div>
            </div>

            {/* Clause 3 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">3</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Investment Risk Disclosure</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-4">
                <p className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle size={14} /> Film investment is a high-risk business activity.
                </p>
                <p>Investors acknowledge and agree that:</p>
                <ul className="list-disc pl-5 space-y-2 text-xs">
                  <li>Returns are entirely dependent on the commercial performance of the film.</li>
                  <li>Revenue depends on theatrical collections, OTT rights, satellite rights, digital rights, overseas distribution, and other exploitation channels.</li>
                  <li>BFI does not guarantee profits, fixed returns, minimum returns, or capital protection.</li>
                </ul>
              </div>
            </div>

            {/* Clause 4 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">4</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Return on Investment</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  Investor returns will be distributed according to the agreed revenue-sharing structure of the specific project.
                </p>
                <p>
                  The amount payable to investors shall be determined only after actual revenue realization.
                </p>
                <div className="border border-zinc-800 p-4 rounded-2xl bg-zinc-950/40 space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">BFI makes no promise or representation regarding:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Specific profit percentages</li>
                    <li>Fixed returns</li>
                    <li>Guaranteed timelines for returns</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clause 5 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">5</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Loss Acknowledgment</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-2">
                <p>
                  Investors understand that film projects may generate lower-than-expected revenue or incur losses.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  BFI shall not be held responsible for any financial losses arising from a project's commercial performance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Clause 6 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">6</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Script Registration Requirement</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  Before submission to BFI, every screenplay, story, script, dialogue draft, or creative work must be officially registered with the appropriate copyright or writers' association authority.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  BFI shall not be responsible for ownership disputes involving unregistered content.
                </p>
              </div>
            </div>

            {/* Clause 7 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">7</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Budget Accuracy</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p>
                  Directors and producers must provide realistic and accurate project budgets.
                </p>
                <div className="border border-zinc-800 p-4 rounded-2xl bg-zinc-950/40 space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">If the actual production cost exceeds the approved budget estimate:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>BFI is not obligated to arrange additional funding.</li>
                    <li>Existing investors cannot be compelled to contribute additional funds.</li>
                    <li>BFI bears no responsibility for budget overruns.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clause 8 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">8</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Additional Funding Requests</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-2">
                <p>
                  Any request for additional funding beyond the approved budget shall be subject to independent review.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  BFI reserves the right to reject additional funding requests without explanation.
                </p>
              </div>
            </div>

            {/* Clause 9 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">9</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Production Responsibility</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-2">
                <p>The director and production team remain solely responsible for:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pl-5 list-disc">
                  <li>Production execution</li>
                  <li>Crew management</li>
                  <li>Scheduling</li>
                  <li>Legal compliance</li>
                  <li>Cost control</li>
                  <li>Delivery of the completed film</li>
                </ul>
              </div>
            </div>

            {/* Clause 10 */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-sm">10</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Community Growth Commitment</h3>
              </div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Support for Future Filmmakers</p>
                <p>
                  BFI is built as a collaborative filmmaking ecosystem. Upon successful completion and release of a film funded through BFI, directors are encouraged to support future filmmakers on the platform.
                </p>
                <div className="border border-zinc-800 p-4 rounded-2xl bg-zinc-950/40 space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Directors may contribute through:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Financial investment in future projects</li>
                    <li>Mentorship and industry guidance</li>
                    <li>Creative collaboration</li>
                  </ul>
                </div>
                <p className="text-xs">
                  The contribution amount shall be determined voluntarily by the director and mutually agreed with BFI. This initiative helps strengthen the BFI filmmaking community and creates opportunities for emerging directors.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* General Conditions (Common Outro Cards) */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-2xl font-serif text-white text-center">General Conditions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-slate-900 p-8 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-yellow-500">11.</span> No Guarantee of Funding
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Submission of a project does not guarantee investor funding. BFI reserves the right to approve or reject any project at its sole discretion.
            </p>
          </div>

          <div className="bg-zinc-950 border border-slate-900 p-8 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-yellow-500">12.</span> No Guarantee of Release
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              BFI does not guarantee theatrical release, OTT acquisition, distribution deals, or commercial success.
            </p>
          </div>
        </div>

        {/* 13. Acceptance */}
        <div className="bg-zinc-950 border border-yellow-500/20 p-8 rounded-3xl space-y-4 text-center max-w-xl mx-auto">
          <div className="flex justify-center text-yellow-500"><BookOpen size={28} /></div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider">13. Acceptance</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            By participating on the BFI platform, all investors, directors, producers, and associated parties acknowledge that they have read, understood, and agreed to these Terms and Conditions.
          </p>
          <hr className="border-zinc-800" />
          <div className="pt-2">
            <h5 className="font-serif text-lg text-white">Bharat Film Industry (BFI)</h5>
            <p className="text-[9px] uppercase tracking-widest text-yellow-500 font-black mt-1">Invest in Stories. Own a Legacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsView;
