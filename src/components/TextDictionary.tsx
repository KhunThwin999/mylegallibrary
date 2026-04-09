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
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

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
    if (!searchTerm.trim()) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.term.toLowerCase().includes(lowerSearch) ||
      entry.type.toLowerCase().includes(lowerSearch) ||
      entry.definition.toLowerCase().includes(lowerSearch)
    );
  }, [entries, searchTerm]);

  // Clear selection if current selection is no longer in results
  useEffect(() => {
    if (selectedEntry && !filteredEntries.includes(selectedEntry)) {
      setSelectedEntry(null);
    }
  }, [filteredEntries, selectedEntry]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-navy font-bold hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Library
        </button>
        <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <FileText className="w-4 h-4" />
          <span>{entries.length} Terms Loaded</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Fixed Header & Search */}
        <div className="shrink-0 border-b border-slate-100">
          <div className="bg-navy text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
              <FileText className="w-full h-full -rotate-12 translate-x-1/4" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <FileText className="w-8 h-8 text-slate-300" />
                  Myanmar-English Dictionary
                </h1>
              </div>
              
              <div className="relative group w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-white transition-colors" />
                <input 
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:ring-4 focus:ring-white/5 focus:border-white/40 outline-none transition-all"
                  disabled={loading || !!error}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
              <Loader2 className="w-12 h-12 text-navy animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Parsing dictionary data...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-slate-50">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <Info className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-500 max-w-xs mx-auto">{error}</p>
            </div>
          ) : (
            <>
              {/* Sidebar: Word List */}
              <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredEntries.length} Results
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {!searchTerm.trim() ? (
                    <div className="p-12 text-center">
                      <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm text-slate-500 font-medium">Type to start searching...</p>
                      <p className="text-xs text-slate-400 mt-1">Enter a term to see definitions</p>
                    </div>
                  ) : filteredEntries.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {filteredEntries.map((entry, index) => (
                        <button
                          key={`${entry.term}-${index}`}
                          onClick={() => setSelectedEntry(entry)}
                          className={`w-full text-left p-4 transition-all hover:bg-white group ${
                            selectedEntry === entry ? 'bg-white border-l-4 border-navy shadow-sm' : 'border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-bold transition-colors ${selectedEntry === entry ? 'text-navy' : 'text-slate-700 group-hover:text-navy'}`}>
                              {entry.term}
                            </span>
                            <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold uppercase">
                              {entry.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm text-slate-500">No matches found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Area: Definition */}
              <div className="hidden md:flex flex-1 flex-col bg-white overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {selectedEntry ? (
                    <motion.div
                      key={selectedEntry.term}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-12 max-w-3xl"
                    >
                      <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-navy/5 text-navy rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                          {selectedEntry.type}
                        </span>
                        <h2 className="text-5xl font-bold text-slate-900 tracking-tight mb-6">
                          {selectedEntry.term}
                        </h2>
                        <div className="h-1.5 w-20 bg-navy rounded-full"></div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Definition / Translation
                        </h4>
                        <p className="text-2xl text-slate-800 leading-relaxed font-medium">
                          {selectedEntry.definition}
                        </p>
                      </div>

                      <div className="mt-12 p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-sm text-slate-500 leading-relaxed italic">
                          This term is part of the Myanmar Legal Library's comprehensive dictionary. Use the search bar to find more related terms.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <FileText className="w-20 h-20 mb-4 opacity-20" />
                      <p className="text-lg font-medium">Select a term to view details</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Definition Overlay */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-50 bg-white md:hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-navy text-white">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="flex items-center gap-2 text-sm font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to List
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Definition</span>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <span className="inline-block px-3 py-1 bg-navy/5 text-navy rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4">
                {selectedEntry.type}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                {selectedEntry.term}
              </h2>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-xl text-slate-800 leading-relaxed">
                  {selectedEntry.definition}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </motion.div>
  );
}
