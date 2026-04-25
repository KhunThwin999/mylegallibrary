import { motion } from 'motion/react';
import { Bell, BookOpen, Clock, ChevronRight, Sparkles, Calendar } from 'lucide-react';

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

interface LatestUpdatesProps {
  books: LegalBook[];
  onBack: () => void;
  onRead: (url: string, title: string) => void;
}

export default function LatestUpdates({ books, onBack, onRead }: LatestUpdatesProps) {
  // Assume the last books in the array are the newest
  const latestBooks = [...books].reverse().slice(0, 10);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight mb-2 flex items-center gap-3">
            <Bell className="w-7 h-7 md:w-8 md:h-8 text-navy shrink-0" />
            Latest Updates
          </h1>
          <p className="text-slate-500 max-w-lg text-sm md:text-base leading-relaxed">
            Stay informed with the newest additions to our <span className="text-navy font-semibold">Myanmar legal collection</span>. 
          </p>
        </div>
        <button 
          onClick={onBack}
          className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm active:scale-95"
        >
          Back to Library
        </button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {latestBooks.length > 0 ? (
          latestBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-navy/20 transition-all flex gap-4 md:gap-6 items-start"
            >
              {/* Notification Badge - Smaller on Mobile */}
              <div className="absolute -top-2 -left-2 w-8 h-8 md:w-12 md:h-12 bg-navy text-white rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20 z-10">
                {index === 0 ? <Sparkles className="w-4 h-4 md:w-6 md:h-6" /> : <Clock className="w-4 h-4 md:w-6 md:h-6" />}
              </div>

              {/* Book Cover Preview - Responsive Size */}
              <div className="w-20 md:w-32 aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md">
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 md:mb-3">
                  <span className="px-1.5 py-0.5 md:px-2.5 md:py-1 bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-100">
                    {book.category}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-navy/40 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {book.year}
                  </span>
                </div>
                
                <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1 md:mb-2 group-hover:text-navy transition-colors leading-tight line-clamp-2">
                  {book.title}
                </h3>
                
                <p className="hidden xs:block text-slate-500 text-xs md:text-sm mb-4 md:mb-6 line-clamp-1 md:line-clamp-2 leading-relaxed font-medium">
                  {book.description || `A new addition to the ${book.category} section.`}
                </p>

                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-50">
                  <span className="text-[10px] md:text-xs text-slate-400 font-medium truncate max-w-[100px] md:max-w-none">By {book.author}</span>
                  <button 
                    onClick={() => onRead(book.read, book.title)}
                    className="flex items-center gap-1.5 text-navy font-bold text-xs md:text-sm hover:gap-2 transition-all active:translate-x-1"
                  >
                    Read
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No recent updates</h3>
            <p className="text-slate-500">Check back later for new legal resources.</p>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "New Legislation", desc: "Access the most recently passed laws and statutory amendments in Myanmar." },
          { title: "Court Rulings", desc: "Recent directives and precedents from the Supreme Court and regional courts." },
          { title: "Legal Guides", desc: "Fresh textbooks and academic resources for law students and practitioners." }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-navy uppercase tracking-widest mb-2">{item.title}</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-navy rounded-[2.5rem] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <h3 className="text-2xl font-bold mb-4 relative z-10">Want more updates?</h3>
        <p className="text-slate-300 mb-8 max-w-md mx-auto relative z-10">Join our community to receive notifications about the latest Myanmar legal documents and books.</p>
        <button className="px-8 py-4 bg-white text-navy rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl shadow-navy/20 relative z-10">
          Subscribe to Newsletter
        </button>
      </div>
    </motion.div>
  );
}
