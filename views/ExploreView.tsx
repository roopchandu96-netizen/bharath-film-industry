
import React, { useEffect, useState, useMemo } from 'react';
import { MovieProject, UserRole, User } from '../types';
import { subscribeToActiveProjects } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import { BFILogo } from '../components/Layout';
import { Search, Sparkles, Film, PlusCircle, ArrowRight, X, ShieldCheck, Eye, EyeOff, ChevronDown, Filter } from 'lucide-react';

interface ExploreViewProps {
  onSelectProject: (p: MovieProject) => void;
  onQuickInvest: (p: MovieProject) => void;
  user: User;
  onOpenSubmission?: () => void;
}

const GENRES = ["All", "Action/Thriller", "Sci-Fi Noir", "Historical Epic", "Modern Drama"];

const ExploreView: React.FC<ExploreViewProps> = ({ onSelectProject, onQuickInvest, user, onOpenSubmission }) => {
  const [projects, setProjects] = useState<MovieProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const unsubscribe = subscribeToActiveProjects(
      (data) => {
        // In real app, we would filter based on user role if needed
        setProjects(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [user.id, user.role]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Privacy Rule: Directors can ONLY see their own projects
      if (user.role === UserRole.DIRECTOR && p.director !== user.name) {
        return false;
      }

      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || p.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [projects, searchQuery, selectedGenre, user.role, user.name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-zinc-900 border-t-yellow-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BFILogo className="w-12 h-12 opacity-50" />
          </div>
        </div>
        <p className="text-[10px] text-yellow-400 uppercase tracking-[0.5em] font-black animate-pulse">Establishing Secure Bidding Link</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={16} className="text-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">
              {user.role === UserRole.INVESTOR ? 'Global Market Bidding List' : 'My Exclusive Bidding Nodes'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif gold-gradient tracking-tight">
            {user.role === UserRole.INVESTOR ? 'BFI Marketplace' : 'Production Vault'}
          </h1>
          <p className="text-xs text-yellow-400/60 font-medium max-w-md leading-relaxed uppercase tracking-widest font-black">
            {user.role === UserRole.INVESTOR
              ? 'Authorized access to Pan-India cinematic synopses. Analyze and deploy capital.'
              : 'Securely manage your listed synopses and track funding bids from verified producers.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-xl w-full">
          {/* Search Bar */}
          <div className="relative flex-1 group preserve-3d">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-400/40" size={18} />
            <input
              type="text"
              placeholder="Search Bidding Nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-xl border border-yellow-400/20 rounded-[1.5rem] py-5 pl-14 pr-12 text-xs font-medium focus:outline-none focus:border-yellow-400 transition-all text-yellow-100 placeholder:text-zinc-600"
            />
          </div>

          {/* Genre Dropdown */}
          <div className="relative min-w-[180px]">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-400/40 pointer-events-none">
              <Filter size={14} />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-xl border border-yellow-400/20 rounded-[1.5rem] py-5 pl-12 pr-12 text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400 appearance-none focus:outline-none focus:border-yellow-400 transition-all cursor-pointer hover:bg-zinc-900/80"
            >
              {GENRES.map(genre => (
                <option key={genre} value={genre} className="bg-zinc-950 text-yellow-400 text-xs">
                  {genre === 'All' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Director Listing Action */}
      {user.role === UserRole.DIRECTOR && (
        <div className="p-10 rounded-[3rem] bg-yellow-400/5 border border-yellow-400/20 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-yellow-400/10 transition-all relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
              <PlusCircle size={40} />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-yellow-400 tracking-tight">List New Synopsis</h3>
              <p className="text-[10px] text-yellow-400/60 uppercase tracking-[0.2em] font-black">Broadcast your vision to the BFI producer circuit</p>
            </div>
          </div>
          <button
            onClick={onOpenSubmission}
            className="px-10 py-5 rounded-2xl bg-yellow-400 text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl hover:-translate-y-1 transition-all relative z-10"
          >
            Initialize Bidding <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Grid Display */}
      {filteredProjects.length === 0 ? (
        <div className="py-40 px-12 text-center space-y-8 bg-zinc-950/50 rounded-[4rem] border border-yellow-400/10 border-dashed max-w-3xl mx-auto">
          <div className="w-28 h-28 rounded-[2.5rem] bg-yellow-400/5 flex items-center justify-center text-yellow-900 mx-auto">
            <Film size={56} strokeWidth={1} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-serif text-yellow-900 tracking-tight">No Bidding Nodes Detected</h3>
            <p className="text-[10px] text-yellow-900/60 leading-relaxed max-w-xs mx-auto uppercase font-black tracking-[0.3em]">
              {user.role === UserRole.DIRECTOR
                ? 'You have not listed any synopses for bidding yet.'
                : 'The Bidding List matches no criteria in the current index.'}
            </p>
            {(searchQuery || selectedGenre !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}
                className="text-[9px] font-black uppercase tracking-widest text-yellow-400 underline mt-4"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="animate-in fade-in slide-in-from-bottom-10 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <ProjectCard
                project={project}
                onClick={onSelectProject}
                onQuickInvest={user.role === UserRole.INVESTOR ? onQuickInvest : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreView;
