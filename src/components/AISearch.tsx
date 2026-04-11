import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, AlertCircle, ChevronRight, BookOpen, ArrowLeft, MessageSquare, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Source {
  title: string;
  section: string;
  score: number;
  excerpt: string;
}

interface SearchResponse {
  question: string;
  answer: string;
  sources: Source[];
}

interface AISearchProps {
  onBack: () => void;
}

export default function AISearch({ onBack }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  const scrollToResults = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://web-production-fb0ac.up.railway.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Search service is currently unavailable. Please try again later.');
      }

      const data: SearchResponse = await response.json();
      setResult(data);
      setTimeout(scrollToResults, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 py-8 md:py-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-navy font-bold hover:gap-3 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Library
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-navy/5 rounded-full border border-navy/10">
          <Sparkles className="w-4 h-4 text-navy" />
          <span className="text-[10px] font-bold text-navy uppercase tracking-widest">AI Legal Assistant</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          AI Legal <span className="text-navy">Search</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Ask questions about Myanmar laws and get instant AI-powered answers with verified legal sources.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-navy to-slate-gray rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row gap-3 bg-white p-3 rounded-[2.2rem] shadow-2xl border border-slate-100">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-navy transition-colors" />
              <input 
                type="text"
                placeholder="Ask a legal question (e.g., What are the rights of a tenant?)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-lg focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-medium"
                disabled={loading}
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="px-10 py-5 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Ask AI
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest py-2">Try asking:</span>
          {['Labor Law rights', 'Company registration', 'Land ownership rules'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 mb-1">Search Error</h3>
              <p className="text-rose-700 text-sm leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-10"
          >
            {/* AI Answer Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-navy p-6 md:p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                  </div>
                  <h2 className="text-xl font-bold">AI Legal Analysis</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Verified Response</span>
              </div>
              <div className="p-8 md:p-12">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                    {result.answer}
                  </p>
                </div>
              </div>
            </div>

            {/* Sources Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4">
                <BookOpen className="w-5 h-5 text-navy" />
                <h3 className="text-lg font-bold text-slate-900">Legal Sources & References</h3>
                <div className="h-px flex-1 bg-slate-100 ml-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.sources.map((source, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-navy uppercase tracking-widest mb-1">Source {idx + 1}</span>
                        <h4 className="font-bold text-slate-900 group-hover:text-navy transition-colors">{source.title}</h4>
                      </div>
                      <div className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-400">
                        {Math.round(source.score * 100)}% Match
                      </div>
                    </div>
                    
                    <div className="relative mb-4">
                      <Quote className="absolute -left-2 -top-2 w-8 h-8 text-slate-50 opacity-50" />
                      <p className="text-sm text-slate-500 leading-relaxed italic relative z-10 line-clamp-4">
                        "{source.excerpt}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Section: {source.section}</span>
                      <button className="flex items-center gap-1 text-[10px] font-bold text-navy uppercase tracking-widest hover:gap-2 transition-all">
                        View Full Text
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={resultsEndRef} />
    </motion.div>
  );
}
