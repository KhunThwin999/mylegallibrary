import { motion } from 'motion/react';
import { 
  BookOpen, 
  Download, 
  ChevronRight, 
  Calendar, 
  User, 
  Tag, 
  Share2, 
  ArrowLeft,
  CheckCircle2,
  History,
  Info
} from 'lucide-react';

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

interface BookDetailProps {
  book: LegalBook;
  onBack: () => void;
  onOpenReader: (url: string, title: string, id: string) => void;
  readingStatus: Record<string, { read: boolean, lastPage?: number }>;
  onToggleRead: (id: string) => void;
  bilingualCategory?: { en: string, my: string };
}

export default function BookDetail({ 
  book, 
  onBack, 
  onOpenReader, 
  readingStatus, 
  onToggleRead,
  bilingualCategory
}: BookDetailProps) {
  const isRead = readingStatus[book.id]?.read;
  const lastPage = readingStatus[book.id]?.lastPage;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto px-4 py-8 md:py-12"
    >
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-navy transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </button>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-start">
        {/* Left Column: Book Cover & Actions */}
        <div className="space-y-8 sticky top-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-navy/10 border border-slate-100 bg-slate-50"
          >
            <img 
              src={book.cover} 
              alt={book.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => onOpenReader(book.read, book.title, book.id)}
              className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-navy/20 active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              Read Document
            </button>
            <a 
              href={book.file}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-4 bg-white text-navy border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </a>
            <button 
              onClick={() => onToggleRead(book.id)}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border ${
                isRead 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 ${isRead ? 'fill-emerald-100' : ''}`} />
              {isRead ? 'Mark as Unread' : 'Mark as Read'}
            </button>
          </div>

          {lastPage && (
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <History className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-700/60 uppercase tracking-widest leading-none mb-1">Last Read</div>
                <div className="font-bold text-amber-900 leading-none">Page {lastPage}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy/5 text-navy text-[10px] font-bold uppercase tracking-widest rounded-full border border-navy/10">
                <Tag className="w-3 h-3" />
                {book.category}
                {bilingualCategory && <span className="opacity-60 ml-1 font-myanmar">({bilingualCategory.my})</span>}
              </div>
              {book.featured && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-100">
                  Featured Resource
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
              {book.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium whitespace-nowrap">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>By {book.author || 'Supreme Court of Myanmar'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Published: {book.year}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-navy" />
              Abstract & Summary
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 leading-loose whitespace-pre-line">
                {book.description || "ဤစာအုပ်သည် မြန်မာနိုင်ငံ၏ ဥပဒေရေးရာများကို အသေးစိတ်လေ့လာနိုင်သော အဖိုးတန်အရင်းအမြစ်တစ်ခုဖြစ်ပါသည်။ This resource provides a deep dive into Myanmar's legal landscape, offering practitioners and students a clear path through complex statutes and procedures."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-xs">Access Policy</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                This document is part of our Open Legal Data initiative. It is provided free of charge for educational and research purposes. Redistribution for commercial use is discouraged.
              </p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-xs">Research Value</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Primary source for studying the {book.category} in Myanmar. Essential for legal drafting, advocacy, and academic research.
              </p>
            </div>
          </div>

          {/* Social Proof / Share */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share this resource</div>
             <div className="flex gap-2">
               <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-navy hover:text-white transition-all">
                 <Share2 className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
