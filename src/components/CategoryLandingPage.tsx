import { motion } from 'motion/react';
import { 
  Gavel, 
  Scale, 
  BookOpen, 
  ChevronRight, 
  Search, 
  Download, 
  ArrowLeft,
  SearchCheck,
  ShieldCheck,
  FileText
} from 'lucide-react';
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

interface CategoryLandingPageProps {
  category: string;
  myanmarTitle: string;
  description: string;
  books: LegalBook[];
  onBack: () => void;
  onRead: (url: string, title: string, id: string) => void;
  onNavigateToBook: (id: string) => void;
}

export default function CategoryLandingPage({ 
  category, 
  myanmarTitle, 
  description, 
  books, 
  onBack, 
  onRead,
  onNavigateToBook
}: CategoryLandingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryBooks = useMemo(() => {
    return books.filter(book => book.category === category);
  }, [books, category]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return categoryBooks;
    const lower = searchTerm.toLowerCase();
    return categoryBooks.filter(book => 
      book.title.toLowerCase().includes(lower) || 
      book.author.toLowerCase().includes(lower)
    );
  }, [categoryBooks, searchTerm]);

  // Specific themes icons based on category
  const Icon = category.includes('Penal') ? Gavel : 
               category.includes('Civil') ? Scale : 
               category.includes('Criminal') ? ShieldCheck : Scale;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-12"
    >
      {/* Back button */}
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-navy transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </button>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy/5 text-navy rounded-full text-[10px] font-bold uppercase tracking-widest border border-navy/10">
            Dedicated Collection
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              {category} <br />
              <span className="text-navy font-myanmar">{myanmarTitle}</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {description}
            </p>
          </div>
          
          <div className="relative group max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-navy transition-colors" />
            <input 
              type="text"
              placeholder={`Search in ${category}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-2xl focus:ring-0 focus:border-navy outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square bg-slate-900 rounded-[3rem] p-12 flex flex-col justify-end relative overflow-hidden group">
            <Icon className="absolute -top-10 -right-10 w-64 h-64 text-white/5 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs">
                <SearchCheck className="w-4 h-4" />
                Verified Legal Data
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                Myanmar {category} <br />
                Reference Gateway
              </h2>
              <div className="h-1.5 w-16 bg-navy rounded-full" />
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl flex flex-col justify-center gap-1">
             <div className="text-3xl font-black text-navy">{categoryBooks.length}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Total Legal Documents</div>
          </div>
        </div>
      </div>

      {/* Grid of books */}
      <section className="space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
           <h3 className="text-xl font-bold text-slate-900">Available Resources</h3>
           <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">
             {filteredBooks.length} Results
           </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={book.id}
              onClick={() => onNavigateToBook(book.id)}
              className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all h-full cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors" />
              </div>
              <div className="p-6">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{book.year}</div>
                <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-navy transition-colors mb-4">{book.title}</h4>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Read Now</span>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-navy group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
               <FileText className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">No documents found</h3>
             <p className="text-slate-500 italic">Try searching with a different term.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}
