import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Gavel, 
  BookOpen, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  LayoutGrid, 
  Shield, 
  Users, 
  UserSearch, 
  MapPin, 
  Briefcase, 
  Globe, 
  Book,
  Bell,
  X,
  Menu,
  Filter,
  Sparkles,
  Scale,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AboutPage from './components/AboutPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TextDictionary from './components/TextDictionary';
import LatestUpdates from './components/LatestUpdates';

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
const BOOKS_PER_PAGE = 8;

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
  const [emailCopied, setEmailCopied] = useState(false);
  const [touchedBookId, setTouchedBookId] = useState<string | null>(null);
  const supportEmail = 'support@myanmarlegallibrary.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<'library' | 'about' | 'privacy' | 'text-dictionary' | 'latest'>('library');

  // Handle URL routing
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/books') setCurrentView('library');
      else if (path === '/dictionary') setCurrentView('text-dictionary');
      else if (path === '/latest') setCurrentView('latest');
      else if (path === '/about') setCurrentView('about');
      else if (path === '/privacy') setCurrentView('privacy');
      else if (path === '/') setCurrentView('library');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (view: typeof currentView) => {
    setCurrentView(view);
    const path = view === 'library' ? '/' : 
                 view === 'text-dictionary' ? '/dictionary' : 
                 `/${view}`;
    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
  };
  
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

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedYear, selectedLetter]);

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
    <div className="min-h-screen bg-off-white font-sans text-slate-900">
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
              <div className="absolute inset-0 border-4 border-t-navy rounded-full animate-spin"></div>
              <Gavel className="absolute inset-0 m-auto w-10 h-10 text-navy" />
            </div>
            <p className="mt-6 text-slate-500 font-medium tracking-widest uppercase text-sm">Preparing Legal Library</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('library')}
            className="flex items-center gap-3 text-navy font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-lg">Myanmar Legal</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Library</span>
                {!loading && books.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-navy text-white text-[10px] font-bold rounded-md shadow-sm">
                    {books.length} Books
                  </span>
                )}
              </div>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {[
              { id: 'library', label: 'Home' },
              { id: 'text-dictionary', label: 'Dictionary' },
              { id: 'latest', label: 'Latest' },
              { id: 'about', label: 'About' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => navigate(item.id as any)}
                className={`relative py-2 px-1 transition-all duration-300 ${
                  currentView === item.id 
                    ? 'text-navy' 
                    : 'text-slate-400 hover:text-navy'
                }`}
              >
                {item.label}
                {currentView === item.id && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy rounded-full"
                  />
                )}
              </button>
            ))}
            <a href="#categories" className="text-slate-400 hover:text-navy transition-colors px-1">Categories</a>
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

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentView === 'library' ? (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero / Featured Section */}
            <AnimatePresence>
              {!loading && featuredBooks.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-7xl mx-auto px-4 pt-8"
                >
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-navy text-white p-8 md:p-16">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                      <Scale className="w-full h-full -rotate-12 translate-x-1/4" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/20">
                        <Sparkles className="w-3 h-3 text-slate-300" />
                        Featured Resource
                      </div>
                      <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                        {featuredBooks[0].title}
                      </h2>
                      <p className="text-slate-200 text-lg mb-10 leading-relaxed opacity-80">
                        {featuredBooks[0].description || "Explore the foundational principles of Myanmar's legal system with this comprehensive guide."}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => openReader(featuredBooks[0].read, featuredBooks[0].title)}
                          className="px-8 py-4 bg-white text-navy rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-xl shadow-navy/20 flex items-center gap-2"
                        >
                          <BookOpen className="w-5 h-5" />
                          Read Now
                        </button>
                        <a 
                          href={featuredBooks[0].file}
                          target="_blank"
                          className="px-8 py-4 bg-muted-green text-white rounded-2xl font-bold hover:bg-green-700 transition-all border border-green-700 flex items-center gap-2"
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

            {/* Centralized Search Section */}
            <section className="max-w-4xl mx-auto px-4 pt-12 pb-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Search the Library</h2>
                <p className="text-slate-500">Find laws, procedures, and legal documentation in seconds.</p>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-navy to-slate-gray rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
                <div className="relative flex flex-col md:flex-row gap-4 bg-white p-3 rounded-[1.8rem] shadow-2xl border border-slate-100">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-navy transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search by title, author, or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl text-lg focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="px-6 py-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-0 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
                    </select>
                    <button 
                      onClick={() => setIsAlphabetModalOpen(true)}
                      className="px-8 py-5 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                    >
                      <Filter className="w-5 h-5" />
                      <span>{selectedLetter === 'All' ? 'A-Z' : `Letter: ${selectedLetter}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:z-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}>
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <h3 className="font-bold text-lg text-navy">Menu & Categories</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {/* Mobile Quick Navigation */}
                <div className="md:hidden mb-8 space-y-3">
                  {[
                    { id: 'latest', label: 'Latest Updates', sub: 'New Arrivals', icon: Bell },
                    { id: 'text-dictionary', label: 'Law Dictionary', sub: 'English-Myanmar', icon: Book },
                    { id: 'about', label: 'About Library', sub: 'Our Mission', icon: Users }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                        currentView === item.id 
                          ? 'bg-navy text-white shadow-xl shadow-navy/20' 
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentView === item.id ? 'bg-white/10' : 'bg-slate-50'
                      }`}>
                        <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm">{item.label}</span>
                        <span className={`text-[10px] font-medium uppercase tracking-widest ${
                          currentView === item.id ? 'opacity-60' : 'text-slate-400'
                        }`}>{item.sub}</span>
                      </div>
                    </button>
                  ))}
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
                                ? 'bg-slate-50 text-navy shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${selectedCategory === cat ? 'text-navy' : 'text-slate-400'}`} />
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
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Home</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 font-medium">{selectedCategory === 'All' ? 'All Books' : selectedCategory}</span>
                  </div>
                  {!loading && (
                    <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">
                      {filteredBooks.length} Results
                    </span>
                  )}
                </div>

                {/* Book Grid */}
                {paginatedBooks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {paginatedBooks.map((book) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={book.id}
                          onClick={() => setTouchedBookId(touchedBookId === book.id ? null : book.id)}
                          className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {book.featured && (
                              <div className="absolute top-4 left-4 px-3 py-1.5 bg-navy/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl">
                                Featured
                              </div>
                            )}

                            {/* Overlay Actions */}
                            <div className={`absolute inset-0 transition-all duration-500 flex items-center justify-center gap-4 p-6 ${touchedBookId === book.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0'}`}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReader(book.read, book.title);
                                }}
                                className="w-14 h-14 bg-white text-navy rounded-2xl flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-2xl active:scale-90"
                              >
                                <BookOpen className="w-6 h-6" />
                              </button>
                              <a 
                                href={book.file}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="w-14 h-14 bg-white text-slate-600 rounded-2xl flex items-center justify-center hover:bg-muted-green hover:text-white transition-all shadow-2xl active:scale-90"
                              >
                                <Download className="w-6 h-6" />
                              </a>
                            </div>
                          </div>

                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-100">
                                {book.category}
                              </span>
                              <span className="text-[9px] font-bold text-navy/40 uppercase tracking-widest">{book.year}</span>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-navy transition-colors leading-tight text-lg flex-1">
                              {book.title}
                            </h3>
                            
                            <p className="text-sm text-slate-400 mb-6 font-medium">By {book.author}</p>
                            
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <a 
                                  href={book.file}
                                  target="_blank"
                                  onClick={(e) => e.stopPropagation()}
                                  className="md:hidden p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-muted-green transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openReader(book.read, book.title);
                                  }}
                                  className="text-sm font-bold text-navy flex items-center gap-1.5 hover:gap-2 transition-all"
                                >
                                  Read Now
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                currentPage === page
                                  ? 'bg-navy text-white shadow-lg shadow-slate-200'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <Book className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">Try adjusting your search or filters to find what you're looking for.</p>
                    <button 
                      onClick={resetFilters}
                      className="px-6 py-2.5 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-slate-200"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        ) : currentView === 'about' ? (
          <AboutPage onBack={() => navigate('library')} />
        ) : currentView === 'text-dictionary' ? (
          <TextDictionary onBack={() => navigate('library')} />
        ) : currentView === 'latest' ? (
          <LatestUpdates books={books} onBack={() => navigate('library')} onRead={openReader} />
        ) : (
          <PrivacyPolicy onBack={() => navigate('library')} />
        )}
      </AnimatePresence>

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
                      selectedLetter === 'All' ? 'bg-navy text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {MYANMAR_ALPHABET.map(letter => (
                    <button 
                      key={letter}
                      onClick={() => { setSelectedLetter(letter); setIsAlphabetModalOpen(false); }}
                      className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg transition-all ${
                        selectedLetter === letter ? 'bg-navy text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                <BookOpen className="w-5 h-5 text-slate-400" />
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

      {currentView !== 'text-dictionary' && (
        <footer className="bg-white border-t border-slate-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
              <div className="max-w-sm">
                <div className="flex items-center gap-3 text-navy font-bold text-xl mb-4">
                  <button 
                    onClick={() => navigate('library')}
                    className="w-8 h-8 bg-navy text-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Scale className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('library')}
                    className="hover:text-navy transition-colors"
                  >
                    Myanmar Legal Library
                  </button>
                </div>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Your digital gateway to Myanmar's legal knowledge. Empowering citizens and professionals with accessible legal resources.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resources</h4>
                  <ul className="space-y-2 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-navy transition-colors">Constitution</a></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Civil Law</a></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Criminal Law</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Library</h4>
                  <ul className="space-y-2 text-sm text-slate-500">
                    <li><button onClick={() => navigate('latest')} className="hover:text-navy transition-colors">Latest Updates</button></li>
                    <li><button onClick={() => navigate('text-dictionary')} className="hover:text-navy transition-colors">English - Myanmar Law Dictionary</button></li>
                    <li><button onClick={() => navigate('about')} className="hover:text-navy transition-colors">About Us</button></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Contact</a></li>
                    <li><button onClick={() => navigate('privacy')} className="hover:text-navy transition-colors">Privacy Policy</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <a href={`mailto:${supportEmail}`} className="text-sm text-navy font-medium hover:underline flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {supportEmail}
                      </a>
                      <button 
                        onClick={copyEmail}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-navy transition-colors uppercase tracking-widest"
                      >
                        {emailCopied ? (
                          <>
                            <Check className="w-3 h-3 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              <p>&copy; 2026 Myanmar Legal Library. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-navy transition-colors">Facebook</a>
                <a href="#" className="hover:text-navy transition-colors">Twitter</a>
                <a href="#" className="hover:text-navy transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
