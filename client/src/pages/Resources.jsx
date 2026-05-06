import { PlayCircle, Download, BookOpen, Star, Search, Filter } from 'lucide-react';

const resources = [
  { type: 'video', title: 'Fundraising for AI Startups in 2024', author: 'Sarah Johnson', duration: '45 mins', rating: 4.9 },
  { type: 'doc', title: 'Go-to-Market Strategy Template', author: 'Nexus Lab', format: 'PDF', rating: 4.8 },
  { type: 'video', title: 'Optimizing LLM Inference Costs', author: 'Arjun Mehta', duration: '32 mins', rating: 4.7 },
  { type: 'doc', title: 'Investor Pitch Deck Structure', author: 'Venture Partners', format: 'PPTX', rating: 4.9 },
  { type: 'video', title: 'Building Scalable Data Pipelines', author: 'Tech Lead', duration: '50 mins', rating: 4.6 },
  { type: 'doc', title: 'Open Source vs Proprietary Models', author: 'AI Research Group', format: 'PDF', rating: 4.5 },
];

export default function Resources() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Startup Resources</h1>
          <p className="text-text-secondary text-sm mt-0.5">Curated guides, templates, and video tutorials.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search resources..." className="bg-transparent border-none outline-none text-sm w-48 text-slate-700" />
          </div>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {resources.map((res, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-50 group cursor-pointer hover:shadow-md transition-shadow">
            <div className="h-40 bg-slate-100 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500"></div>
              {res.type === 'video' ? (
                <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center z-10 text-primary">
                  <PlayCircle size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center z-10 text-blue-500">
                  <Download size={24} />
                </div>
              )}
              {res.type === 'video' && (
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                  {res.duration}
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${res.type === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                  {res.type === 'video' ? 'Masterclass' : 'Template'}
                </span>
                <span className="text-[11px] text-yellow-500 font-bold flex items-center gap-1 ml-auto">
                  <Star size={12} fill="currentColor" /> {res.rating}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors">{res.title}</h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <BookOpen size={13} /> By {res.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
