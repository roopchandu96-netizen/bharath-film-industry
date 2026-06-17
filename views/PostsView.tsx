import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, ArrowRight, BookOpen, Clock, ChevronLeft, Heart, Share2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  content: string[];
  keywords: string[];
  likes: number;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Unlocking Indian Cinema: How BFI\'s Decentralized Escrow Protects Film Investors',
    slug: 'bfi-decentralized-escrow-protects-film-investors',
    category: 'Finance & Escrow',
    readTime: '6 Min Read',
    date: 'June 17, 2026',
    author: 'BFI Editorial Board',
    summary: 'Discover how Bharat Film Industry uses milestone-based escrow accounts and decentralized governance to safeguard film investments in the Indian cinema sector.',
    keywords: ['film investment India', 'cinema finance', 'secure escrow', 'BFI', 'Bharat Film Industry', 'film production milestones', 'UDYAM-AP-23-0080757'],
    likes: 124,
    content: [
      'The Indian film industry is one of the largest and most vibrant creative economies in the world. Yet, for decades, it has operated under a cloud of financial opacity. Independent film producers and first-time investors often face high-risk environments, unregulated cash transactions, and sudden project cancellations. Traditional studios have held a monopoly over which stories get told, leaving independent investors with limited security and small filmmakers without access to capital.',
      'Bharat Film Industry (BFI) was founded to dismantle this gatekeeping and introduce institutional-grade security to movie investments. At the heart of our solution is the BFI Milestone-Based Secure Escrow system. Rather than deploying capital all at once, BFI registers production nodes with precise, auditable milestones. Backers can rest assured that their funds are released only when verified production milestones—such as screenplay completion, casting lock, principal photography, and post-production—are achieved.',
      'Our regulatory alignment is absolute. Registered under Udyam Registration (UDYAM-AP-23-0080757) and GSTIN (37CZVPR2615G1ZU), BFI is bridging the gap between direct public funding and premium cinema. When an investor backs a script on our marketplace, their transaction is governed by smart compliance rules that guarantee clear profit-sharing parameters once the movie goes live or signs theatrical and streaming distribution rights.',
      'This decentralized escrow model shields investors from standard market leakages, ensuring that 100% of deployed capital goes straight to production value. The result? Safer investments, high-caliber cinema, and an open gateway for the global Indian diaspora to participate in the lucrative box office economy.'
    ]
  },
  {
    id: '2',
    title: 'The Rise of Decentralized Film Production: Creative Freedom for Directors',
    slug: 'decentralized-film-production-creative-freedom',
    category: 'Creative Hub',
    readTime: '5 Min Read',
    date: 'June 15, 2026',
    author: 'Prathapaneni Roopchandu',
    summary: 'BFI Founder & Director Prathapaneni Roopchandu writes on how decentralized production networks return the greenlight power back to creators and audiences.',
    keywords: ['decentralized film production', 'movie directors', 'Prathapaneni Roopchandu', 'independent cinema India', 'script marketplace', 'Preema Preethi'],
    likes: 189,
    content: [
      'In traditional cinema, a director\'s vision is often diluted by corporate executives, distributors, and studio gatekeepers. Creative decisions—from casting choices to script endings—are frequently made based on generic algorithms rather than artistic truth. This dynamic has stifled cinematic innovation in India, forcing brilliant screenwriters and directors to spend years begging for studio approvals.',
      'Through Bharat Film Industry (BFI), we are returning the power of the greenlight directly to the creators and the audience. BFI functions as a decentralized production network. As a director, you list your screenplay on our marketplace. You broadcast your bidding node, logline, and budget. Instead of seeking one massive studio backing, you gain support from a collective of co-producers who believe in the story.',
      'My personal journey directing the short film "Preema Preethi" showcased this model. By bypassing standard bureaucratic blockades, we focused purely on aesthetic and narrative excellence. The BFI platform allowed us to register our screenplay securely, prove copyright ownership, and execute production with full creative autonomy.',
      'By democratizing cinematic production, BFI ensures that if a script is compelling, it receives funding. This decentralized approach creates a diverse, rich landscape of movies, giving rise to unique regional blockbusters and niche stories that would otherwise never see the light of day.'
    ]
  },
  {
    id: '3',
    title: 'How to Invest in South Indian Cinema: A Guide to the Script Marketplace',
    slug: 'how-to-invest-south-indian-cinema-guide',
    category: 'Investor Guide',
    readTime: '8 Min Read',
    date: 'June 12, 2026',
    author: 'BFI Investment Analytics',
    summary: 'A step-by-step roadmap for institutional and retail capital partners to navigate BFI\'s script marketplace, assess AI viability, and deploy capital.',
    keywords: ['script marketplace', 'buy movie scripts', 'invest in movie', 'Indian film industry funding', 'film equity', 'box office profit'],
    likes: 95,
    content: [
      'South Indian cinema is experiencing an unprecedented global boom, breaking box office records across theatrical and streaming platforms. However, until recently, participating in this growth was reserved for a select group of wealthy insiders. BFI is changing that by offering a structured, transparent gateway for anybody to invest in the next big cinematic hit.',
      'For first-time investors, navigating our script marketplace is straightforward. Users register on our secure platform, complete compliance checks, and browse our active project listings. Each listing includes the official logline, detailed synopsis, and registry IDs.',
      'To help backers make informed choices, BFI incorporates advanced Gemini AI-powered analysis. Each screenplay listed receives a comprehensive market viability score and a genre pulse check, evaluating target demographics, budget realism, and potential distribution bottlenecks. Investors can view previous works, check the verified production roadmap, and choose their investment tier.',
      'Our investment tiers—ranging from Associate Supporter to Co-Producer—offer distinct perks, including official IMDb credits, set visits, premiere invites, and box office equity shares. By combining security, AI analytics, and box office profit-sharing, BFI is democratizing access to the multi-billion rupee Indian film market.'
    ]
  }
];

const PostsView: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>({
    '1': ARTICLES[0].likes,
    '2': ARTICLES[1].likes,
    '3': ARTICLES[2].likes,
  });
  const [likedList, setLikedList] = useState<string[]>([]);

  useEffect(() => {
    if (selectedArticle) {
      document.title = `${selectedArticle.title} | BFI Blog & Insights`;
    } else {
      document.title = 'BFI Blog & News | Bharat Film Industry | Decentralized Film Finance';
    }
  }, [selectedArticle]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedList.includes(id)) {
      setLikesCount(prev => ({ ...prev, [id]: prev[id] - 1 }));
      setLikedList(prev => prev.filter(item => item !== id));
    } else {
      setLikesCount(prev => ({ ...prev, [id]: prev[id] + 1 }));
      setLikedList(prev => [...prev, id]);
    }
  };

  const handleShare = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      const dummy = document.createElement('input');
      const text = `${article.title} - Read more at https://www.bfiiy.com/`;
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
      alert('Article link copied to clipboard!');
    }
  };

  const categories = ['All', 'Finance & Escrow', 'Creative Hub', 'Investor Guide'];

  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 animate-in fade-in duration-500 text-slate-200">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-slate-800 hover:border-yellow-400/30 text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest mb-10 group"
          id="btn-back-to-blog"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Articles
        </button>

        <article className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-widest">
              <Sparkles size={10} /> {selectedArticle.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-white leading-tight">{selectedArticle.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <User size={12} />
                <span>By {selectedArticle.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{selectedArticle.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span>{selectedArticle.readTime}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 italic text-zinc-300 leading-relaxed font-serif text-lg">
            "{selectedArticle.summary}"
          </div>

          <div className="space-y-6 text-slate-300 text-base md:text-lg leading-relaxed font-sans font-light">
            {selectedArticle.content.map((p, idx) => (
              <p key={idx} className="first-letter:text-3xl first-letter:font-serif first-letter:text-yellow-500 first-letter:float-left first-letter:mr-2 first-letter:font-black first-letter:leading-none">
                {idx === 0 ? p : p.slice(0)}
              </p>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-wrap gap-2">
            {selectedArticle.keywords.map((word, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-zinc-900 text-xs text-zinc-500 font-mono">
                #{word.replace(/\s+/g, '')}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-zinc-900">
            <button 
              onClick={(e) => handleLike(selectedArticle.id, e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-xs font-bold uppercase tracking-widest ${
                likedList.includes(selectedArticle.id)
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  : 'bg-zinc-900 border-slate-800 text-zinc-400 hover:text-white'
              }`}
              id={`btn-like-detail-${selectedArticle.id}`}
            >
              <Heart size={16} fill={likedList.includes(selectedArticle.id) ? 'currentColor' : 'none'} />
              <span>{likesCount[selectedArticle.id]} Likes</span>
            </button>

            <button 
              onClick={(e) => handleShare(selectedArticle, e)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-slate-800 text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              id={`btn-share-detail-${selectedArticle.id}`}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16 animate-in fade-in duration-700 text-slate-200">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-widest">
          <BookOpen size={12} /> BFI Insights
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-tight">
          Blog & <span className="text-yellow-500 italic">News</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Deep dives into film financing, production roadmaps, creative freedom, and regular announcements from the Bharat Film Industry team.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900/30 p-6 rounded-3xl border border-slate-800/80 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id={`tab-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search articles & tags..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-slate-800 rounded-2xl py-3 px-5 text-sm text-white focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600"
            id="input-blog-search"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div 
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/30 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between shadow-xl transition-all duration-500 hover:translate-y-[-4px] group cursor-pointer relative overflow-hidden"
              id={`card-article-${article.id}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none -translate-x-1/4 -translate-y-1/4" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">{article.category}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{article.readTime}</span>
                </div>
                <h3 className="text-xl font-serif text-white group-hover:text-yellow-500 transition-colors leading-snug">{article.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-light line-clamp-3">{article.summary}</p>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <span>Read Article</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleLike(article.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold ${
                      likedList.includes(article.id)
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : 'bg-zinc-950 border-slate-900 text-zinc-500 hover:text-white'
                    }`}
                    id={`btn-like-${article.id}`}
                  >
                    <Heart size={12} fill={likedList.includes(article.id) ? 'currentColor' : 'none'} />
                    <span>{likesCount[article.id]}</span>
                  </button>

                  <button 
                    onClick={(e) => handleShare(article, e)}
                    className="p-1.5 rounded-full bg-zinc-950 border border-slate-900 text-zinc-500 hover:text-white transition-all"
                    id={`btn-share-${article.id}`}
                    aria-label="Share article"
                  >
                    <Share2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 space-y-4">
            <BookOpen size={48} className="mx-auto opacity-30" />
            <p className="text-base uppercase font-black tracking-widest">No articles found matching your query.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PostsView;
