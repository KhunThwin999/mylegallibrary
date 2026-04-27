import { motion, AnimatePresence } from 'motion/react';
import { Scale, BookOpen, ChevronRight, Search, FileText, Filter, Calendar, Download } from 'lucide-react';
import { useState, useMemo } from 'react';

interface LegalBook {
  id: string;
  title: string;
  author: string;
  category: string;
  year: string;
  description: string;
  cover: string;
  read: string;
  file: string;
  featured?: boolean | string;
}

interface LegalRulingsProps {
  books: LegalBook[];
  onBack: () => void;
  onRead: (url: string, title: string) => void;
}

export default function LegalRulings({ books, onBack, onRead }: LegalRulingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const RULINGS_PER_PAGE = 10;
  
  // Filter books related to rulings (စီရင်ထုံး)
  const rulingBooks = useMemo(() => {
    return books.filter(book => 
      book.title.includes('စီရင်ထုံး') || 
      book.category.includes('စီရင်ထုံး') ||
      book.title.toLowerCase().includes('ruling') ||
      book.title.toLowerCase().includes('decision')
    ).sort((a, b) => b.year.localeCompare(a.year));
  }, [books]);

  const filteredRulings = useMemo(() => {
    let result = rulingBooks;
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = rulingBooks.filter(book => 
        book.title.toLowerCase().includes(lowerSearch) ||
        book.year.includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [rulingBooks, searchTerm]);

  const totalPages = Math.ceil(filteredRulings.length / RULINGS_PER_PAGE);

  const paginatedRulings = useMemo(() => {
    const start = (currentPage - 1) * RULINGS_PER_PAGE;
    return filteredRulings.slice(start, start + RULINGS_PER_PAGE);
  }, [filteredRulings, currentPage]);

  // Group by year
  const groupedRulings = useMemo(() => {
    const groups: Record<string, LegalBook[]> = {};
    paginatedRulings.forEach(book => {
      const year = book.year || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(book);
    });
    // Sort years descending
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(year => ({
      year,
      books: groups[year]
    }));
  }, [paginatedRulings]);

  // Reset to page 1 on search
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 py-8 md:py-12"
    >
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-6">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-navy font-bold text-sm hover:text-navy/70 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </button>
          <div className="relative">
            <h1 className="text-3xl md:text-5xl font-black text-navy tracking-tight mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-navy text-white rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-navy/20 shrink-0">
                <Scale className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <div className="font-myanmar tracking-normal">
                တရားစီရင်ထုံးများ
                <span className="block text-base md:text-xl font-bold text-slate-400 tracking-wider uppercase mt-1 md:mt-3 font-sans">Court Decisions List</span>
              </div>
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl leading-relaxed font-medium text-sm md:text-base font-myanmar tracking-normal">
            ဗဟိုတရားရုံးနှင့် အဆင့်ဆင့်သော တရားရုံးများမှ ထုတ်ပြန်ထားသည့် အရေးကြီးသော တရားစီရင်ထုံးများအား ခုနှစ်အလိုက် ရှာဖွေဖတ်ရှုနိုင်ပါသည်။
          </p>
        </div>

        <div className="relative group w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-navy transition-colors" />
          </div>
          <input
            type="text"
            placeholder="စီရင်ထုံး ရှာဖွေရန်..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl text-base placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List of rulings grouped by year */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {groupedRulings.length > 0 ? (
            groupedRulings.map((group) => (
              <motion.div
                key={group.year}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                tabIndex={0}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-1.5 bg-navy text-white rounded-xl text-sm font-black tracking-widest shadow-lg shadow-navy/10">
                    {group.year}
                  </div>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {group.books.map((book) => (
                    <motion.div
                      key={book.id}
                      onClick={() => onRead(book.read, book.title)}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:p-5 bg-white border border-slate-200 rounded-2xl hover:border-navy hover:shadow-xl hover:shadow-navy/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-navy transition-all"></div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {book.category}
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-navy transition-colors truncate">
                          {book.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium truncate">
                          By {book.author || 'Supreme Court of Myanmar'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 md:ml-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRead(book.read, book.title); }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 group-hover:bg-navy group-hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="font-myanmar tracking-normal">ဖတ်ရှုရန်</span>
                        </button>
                        <a 
                          href={book.file}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-400 hover:text-navy hover:bg-navy/5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center bg-white rounded-[3rem] border border-slate-100"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">စီရင်ထုံးများ ရှာမတွေ့ပါ။</h3>
              <p className="text-slate-500">ရှာဖွေမှု စကားလုံး ပြောင်းလဲ၍ ထပ်မံကြိုးစားကြည့်ပါ။</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Prev
            </button>
            
            <div className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-navy shadow-sm">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Showing {(currentPage - 1) * RULINGS_PER_PAGE + 1} - {Math.min(currentPage * RULINGS_PER_PAGE, filteredRulings.length)} of {filteredRulings.length} Rulings
          </div>
        </div>
      )}

      {/* SEO Footer for this page */}
      <div className="mt-24 p-12 bg-slate-50 rounded-[3rem] border border-slate-200/60 text-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Myanmar High Court & Supreme Court Decisions</h2>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-sm">
          ကျွန်ုပ်တို့၏ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်တွင် ၂၀ ရာစုမှ ယနေ့အထိ အရေးကြီးသော ဥပဒေ စီရင်ထုံး အချက်အလက်များကို စနစ်တကျ စုစည်းတင်ပြထားပါသည်။ 
          ဥပဒေပညာရှင်များနှင့် ကျောင်းသားများအတွက် အဖိုးတန်သော အကိုးအကား အချက်အလက်များ ဖြစ်ပါသည်။
        </p>
      </div>
    </motion.div>
  );
}
