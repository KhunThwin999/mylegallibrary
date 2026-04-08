import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, ArrowLeft, X, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DictionaryEntry {
  term: string;
  type: string;
  definition: string;
}

interface TextDictionaryProps {
  onBack: () => void;
}

export default function TextDictionary({ onBack }: TextDictionaryProps) {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch('/dictionary.txt');
        if (!response.ok) throw new Error('Failed to load dictionary file');
        
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const parsedEntries = lines.map(line => {
          let term = 'Unknown';
          let type = 'General';
          let definition = 'No definition available.';

          if (line.includes(' / ')) {
            const parts = line.split(' / ');
            term = parts[0]?.trim() || 'Unknown';
            const remaining = parts[1] || '';
            
            if (remaining.includes(' - ')) {
              const subParts = remaining.split(' - ');
              type = subParts[0]?.trim() || 'General';
              definition = subParts[1]?.trim() || 'No definition available.';
            } else {
              definition = remaining.trim();
            }
          } else if (line.includes(' - ')) {
            const parts = line.split(' - ');
            term = parts[0]?.trim() || 'Unknown';
            definition = parts[1]?.trim() || 'No definition available.';
            
            // Extract type from brackets if present in term, e.g., "abide by [PHRV]"
            const typeMatch = term.match(/\[(.*?)\]/);
            if (typeMatch) {
              type = typeMatch[1];
              term = term.replace(/\[.*?\]/, '').trim();
            }
          } else {
            term = line.trim();
          }
          
          return { term, type, definition };
        });
        
        setEntries(parsedEntries);
      } catch (err) {
        console.error(err);
        setError('Could not load the dictionary data. Please ensure dictionary.txt exists in the public folder.');
      } finally {
        setLoading(false);
      }
    };

    loadDictionary();
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const lowerSearch = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.term.toLowerCase().includes(lowerSearch) ||
      entry.type.toLowerCase().includes(lowerSearch) ||
      entry.definition.toLowerCase().includes(lowerSearch)
    );
  }, [entries, searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-navy font-bold mb-8 hover:gap-3 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Library
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-navy text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <FileText className="w-full h-full -rotate-12 translate-x-1/4" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4 tracking-tight flex items-center gap-4">
              <FileText className="w-10 h-10 text-slate-300" />
              Myanmar-English Dictionary
            </h1>
            <p className="text-slate-200 text-lg max-w-2xl leading-relaxed">
              Search through thousands of English terms with their Myanmar translations. Fast, accurate, and easy to use.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-navy transition-colors" />
            <input 
              type="text"
              placeholder="Search terms, types, or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-lg focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none transition-all shadow-sm"
              disabled={loading || !!error}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 md:p-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-navy animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Parsing dictionary data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <Info className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-500 max-w-xs mx-auto">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Showing {filteredEntries.length} of {entries.length} entries
                </p>
              </div>

              {filteredEntries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredEntries.map((entry, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.5) }}
                      key={`${entry.term}-${index}`}
                      className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-navy hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <h3 className="text-xl font-bold text-navy group-hover:translate-x-1 transition-transform">
                          {entry.term}
                        </h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                          {entry.type}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {entry.definition}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-12 h-12 text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
                  <p className="text-slate-500">Try searching for a different term or category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
