import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Gavel, 
  BookOpen, 
  Download, 
  ChevronRight, 
  LayoutGrid, 
  Shield, 
  Users, 
  UserSearch, 
  MapPin, 
  Briefcase, 
  Globe, 
  Book,
  X,
  Menu,
  Filter,
  Sparkles,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
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

const CATEGORY_ICONS: Record<string, any> = {
  'All': LayoutGrid,
  'Law & Constitution': Gavel,
  'Police Procedure': Shield,
  'Penal Code': Gavel,
  'Civil Law': Users,
  'Criminal Law': UserSearch,
  'Land Law': MapPin,
  'Business Law': Briefcase,
  'International Law': Globe,
  'Default': Book
};

const MYANMAR_ALPHABET = ['က', 'ခ', 'ဂ', 'ဃ', 'င', 'စ', 'ဆ', 'ဇ', 'ဈ', 'ည', 'ဋ', 'ဌ', 'ဍ', 'ဎ', 'ဏ', 'တ', 'ထ', 'ဒ', 'ဓ', 'န', 'ပ', 'ဖ', 'ဗ', 'ဘ', 'မ', 'ယ', 'ရ', 'လ', 'ဝ', 'သ', 'ဟ', 'ဠ', 'အ'];

const GOOGLE_SHEET_URL = 'https://opensheet.elk.sh/1HCOpKGKhv_Ggm3r6dtvldqUynv5z6vLy98jjeOSrS4I/Sheet1';

function fixDriveLink(url: string, type: 'preview' | 'download' | 'cover' | 'thumbnail' = 'preview') {
  if (!url) return '';
  const idMatch = url.match(/[-\w]{25,}/);
  const fileId = idMatch ? idMatch[0] : null;
  if (fileId) {
    if (type === 'preview') return `https://drive.google.com/file/d/${fileId}/preview`;
    if (type === 'cover') return `https://lh3.googleusercontent.com/d/${fileId}`;
    if (type === 'thumbnail') return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}

export default function App() {
  const [books, setBooks] = useState<LegalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState('');
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(GOOGLE_SHEET_URL);
        if (!response.ok) throw new Error('Failed to fetch from Google Sheets');
        const data = await response.json();
        
        const mappedBooks = data.map((book: any, index: number) => {
          const id = book.id || String(index + 1);
          let coverUrl = book.cover ? fixDriveLink(book.cover, 'cover') : fixDriveLink(book.read || book.file, 'thumbnail');
          if (!coverUrl || coverUrl === book.cover) {
             // If not a drive link and no cover, use placeholder
             if (!book.cover) coverUrl = `https://picsum.photos/seed/${id}/400/600`;
          }

          return {
            ...book,
            id: id,
            read: fixDriveLink(book.read, 'preview'),
            file: fixDriveLink(book.file, 'download'),
            cover: coverUrl,
            featured: String(book.featured).toUpperCase() === 'TRUE'
          };
        });

        setBooks(mappedBooks);
      } catch (error) {
        console.error('Error loading books:', error);
        // Fallback to local if sheet fails
        try {
          const localRes = await fetch('/books.json');
          const localData = await localRes.json();
          setBooks(localData);
        } catch (e) {
          console.error('Local fallback failed too');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(books.map((b: LegalBook) => b.year))].filter(Boolean).sort((a: string, b: string) => b.localeCompare(a));
    return ['All', ...uniqueYears];
  }, [books]);

  const categories = useMemo(() => {
    const uniqueCats = [...new Set(books.map((b: LegalBook) => b.category))];
    return ['All', ...uniqueCats];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchTerm || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === 'All' || book.year === selectedYear;
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const matchesLetter = selectedLetter === 'All' || book.title.trim().startsWith(selectedLetter);

      return matchesSearch && matchesYear && matchesCategory && matchesLetter;
    });
  }, [books, searchTerm, selectedYear, selectedCategory, selectedLetter]);

  const openReader = (url: string, title: string) => {
    setActivePdf(url);
    setViewerTitle(title);
    document.body.style.overflow = 'hidden';
  };

  const closeReader = () => {
    setActivePdf(null);
    document.body.style.overflow = 'auto';
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setSelectedLetter('All');
  };

  const featuredBooks = useMemo(() => {
    return books.filter(b => b.featured);
  }, [books]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-slate-900">
      {/* Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              <Gavel className="absolute inset-0 m-auto w-10 h-10 text-indigo-600" />
            </div>
            <p className="mt-6 text-slate-500 font-medium tracking-widest uppercase text-sm">Preparing Legal Archives</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-900 font-bold text-2xl tracking-tight">
            <div className="w-10 h-10 bg-indigo-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg">Myanmar Legal</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Digital Archive</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-500">
            <a href="#" className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Home</a>
            <a href="#categories" className="hover:text-indigo-600 transition-colors">Categories</a>
            <a href="#latest" className="hover:text-indigo-600 transition-colors">Latest</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Featured Section */}
      <AnimatePresence>
        {!loading && featuredBooks.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 pt-8"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 text-white p-8 md:p-16">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <Scale className="w-full h-full -rotate-12 translate-x-1/4" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/20">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Featured Resource
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                  {featuredBooks[0].title}
                </h2>
                <p className="text-indigo-100 text-lg mb-10 leading-relaxed opacity-80">
                  {featuredBooks[0].description || "Explore the foundational principles of Myanmar's legal system with this comprehensive guide."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => openReader(featuredBooks[0].read, featuredBooks[0].title)}
                    className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Read Now
                  </button>
                  <a 
                    href={featuredBooks[0].file}
                    target="_blank"
                    className="px-8 py-4 bg-indigo-800 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all border border-indigo-700 flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:z-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h3 className="font-bold text-lg">Categories</h3>
            <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Legal Categories</h3>
            </div>
            <ul className="p-2">
              {categories.map(cat => {
                const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS['Default'];
                return (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedCategory === cat 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${selectedCategory === cat ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-medium">Legal Books</span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {selectedCategory === 'All' ? 'All Legal Books' : selectedCategory}
                </h1>
                <p className="text-slate-500">Browse our comprehensive collection of Myanmar legal resources.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search books, authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
                  </select>

                  <button 
                    onClick={() => setIsAlphabetModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span>{selectedLetter === 'All' ? 'A-Z' : selectedLetter}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Book Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={book.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
                    <img 
                      src={book.cover} 
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {book.featured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg">
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button 
                        onClick={() => openReader(book.read, book.title)}
                        className="p-3 bg-white text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                      <a 
                        href={book.file}
                        target="_blank"
                        className="p-3 bg-white text-slate-600 rounded-full hover:bg-slate-800 hover:text-white transition-all shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 block">{book.category}</span>
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors leading-tight">{book.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">By {book.author}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-medium text-slate-400">{book.year}</span>
                      <button 
                         onClick={() => openReader(book.read, book.title)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        Read Now <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Book className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={resetFilters}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Alphabet Modal */}
      <AnimatePresence>
        {isAlphabetModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAlphabetModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xl">Filter by Myanmar Consonant</h3>
                <button onClick={() => setIsAlphabetModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  <button 
                    onClick={() => { setSelectedLetter('All'); setIsAlphabetModalOpen(false); }}
                    className={`aspect-square flex items-center justify-center rounded-xl font-bold transition-all ${
                      selectedLetter === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {MYANMAR_ALPHABET.map(letter => (
                    <button 
                      key={letter}
                      onClick={() => { setSelectedLetter(letter); setIsAlphabetModalOpen(false); }}
                      className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg transition-all ${
                        selectedLetter === letter ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer */}
      <AnimatePresence>
        {activePdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900 flex flex-col"
          >
            <div className="h-16 bg-slate-800 px-6 flex items-center justify-between text-white border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold truncate max-w-md">{viewerTitle}</h3>
              </div>
              <button 
                onClick={closeReader}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-slate-800">
              <iframe 
                src={activePdf} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 text-indigo-900 font-bold text-xl mb-4">
                <div className="w-8 h-8 bg-indigo-900 text-white rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <span>Myanmar Legal Archive</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-sm">
                Your digital gateway to Myanmar's legal knowledge. Empowering citizens and professionals with accessible legal resources.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Constitution</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Civil Law</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Criminal Law</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Archive</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            <p>&copy; 2026 Myanmar Legal Digital Archive. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-indigo-600 transition-colors">Facebook</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
