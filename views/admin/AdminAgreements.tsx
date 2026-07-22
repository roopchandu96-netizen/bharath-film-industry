import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Agreement } from '../../types';
import { FileText, Download, ShieldCheck, Search } from 'lucide-react';

export const AdminAgreements: React.FC = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const { data, error } = await supabase
          .from('agreements')
          .select(`
            *,
            profiles:user_id (name, email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAgreements(data || []);
      } catch (err) {
        console.error('Error fetching agreements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreements();
  }, []);

  const handleDownload = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('agreements').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      alert('Error downloading PDF');
    }
  };

  const filtered = agreements.filter(a => 
    a.agreement_number.toLowerCase().includes(search.toLowerCase()) ||
    (a as any).profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (a as any).profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-serif text-white flex items-center gap-3">
          <FileText className="text-yellow-500" size={20} />
          Legal Agreements
          <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">{filtered.length}</span>
        </h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, Name, Email..."
            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-[2rem] p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              <th className="p-4">Agreement No.</th>
              <th className="p-4">Type</th>
              <th className="p-4">User</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-zinc-300">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-600">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-600">No agreements found.</td></tr>
            ) : (
              filtered.map(agr => (
                <tr key={agr.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4 font-mono text-xs">{agr.agreement_number}</td>
                  <td className="p-4 uppercase text-[10px] tracking-wider text-zinc-400">{agr.type}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{(agr as any).profiles?.name}</div>
                    <div className="text-xs text-zinc-500">{(agr as any).profiles?.email}</div>
                  </td>
                  <td className="p-4">
                    {agr.status === 'signed' ? (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-green-900/20 text-green-500 border border-green-500/20 flex items-center gap-1 w-max">
                        <ShieldCheck size={10} /> Signed
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-yellow-900/20 text-yellow-500 border border-yellow-500/20 w-max inline-block">
                        {agr.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-zinc-500 text-xs">
                    {new Date(agr.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {agr.pdf_url && (
                      <button 
                        onClick={() => handleDownload(agr.pdf_url!)}
                        className="px-3 py-1.5 bg-zinc-900 text-yellow-500 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                      >
                        <Download size={12} /> PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
