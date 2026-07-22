import React, { useState, useEffect } from 'react';
import { supabase } from '../services/firebase';
import { Agreement, User } from '../types';
import { FileText, Download, ShieldCheck, Search, ShieldAlert, FileSignature } from 'lucide-react';
import { AgreementSigningView } from './AgreementSigningView';

interface UserAgreementsProps {
  user: User;
}

export const UserAgreements: React.FC<UserAgreementsProps> = ({ user }) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [signingId, setSigningId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgreements();
  }, [user.id, signingId]); // Re-fetch when signing completes

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agreements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgreements(data || []);
    } catch (err) {
      console.error('Error fetching agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('agreements').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      alert('Error downloading PDF');
    }
  };

  if (signingId) {
    return (
      <div className="animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => setSigningId(null)}
          className="mb-4 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest"
        >
          ← Back to Agreements
        </button>
        <AgreementSigningView 
          agreementId={signingId} 
          user={user}
          onSuccess={() => setSigningId(null)} 
          onCancel={() => setSigningId(null)} 
        />
      </div>
    );
  }

  const filtered = agreements.filter(a => 
    a.agreement_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-white flex items-center gap-3">
            <FileText className="text-yellow-500" size={24} />
            My Legal Agreements
          </h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Manage & Sign Contracts</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Agreement No..."
            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-48 animate-pulse"></div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-zinc-800 border-dashed rounded-3xl bg-zinc-900/30">
            <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No agreements found.</p>
          </div>
        ) : (
          filtered.map(agr => (
            <div key={agr.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all group">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {agr.type} AGREEMENT
                  </span>
                  <div className="text-white font-mono text-sm mt-1">{agr.agreement_number}</div>
                </div>
                {agr.status === 'signed' ? (
                  <ShieldCheck className="text-green-500 h-6 w-6" />
                ) : (
                  <ShieldAlert className="text-yellow-500 h-6 w-6" />
                )}
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Status</span>
                  {agr.status === 'signed' ? (
                    <span className="text-green-500 font-bold uppercase text-[10px] tracking-wider bg-green-500/10 px-2 py-1 rounded">Signed</span>
                  ) : (
                    <span className="text-yellow-500 font-bold uppercase text-[10px] tracking-wider bg-yellow-500/10 px-2 py-1 rounded">Pending Signature</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Date Issued</span>
                  <span className="text-zinc-300 font-mono text-xs">{new Date(agr.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-4 border-t border-zinc-800 flex gap-3">
                  {agr.status === 'signed' && agr.pdf_url ? (
                    <button 
                      onClick={() => handleDownload(agr.pdf_url!)}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-yellow-500/50 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSigningId(agr.id)}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <FileSignature size={14} /> Review & Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
