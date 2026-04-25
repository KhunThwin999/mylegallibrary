import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Gavel, 
  BookOpen, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
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
  Check,
  CheckCircle2,
  Bookmark,
  History,
  BookPlus,
  Send,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AboutPage from './components/AboutPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TextDictionary from './components/TextDictionary';
import LatestUpdates from './components/LatestUpdates';
import RequestBookForm from './components/RequestBookForm';
import LegalRulings from './components/LegalRulings';
import LandingPage from './components/LandingPage';
import BookDetail from './components/BookDetail';
import CategoryLandingPage from './components/CategoryLandingPage';

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

// Category Mappings for Bilingual Support
const CATEGORIES_BILINGUAL: Record<string, { en: string; my: string }> = {
  'Law & Constitution': { en: 'Law & Constitution', my: 'ဥပဒေနှင့် ဖွဲ့စည်းပုံအခြေခံဥပဒေ' },
  'Police Procedure': { en: 'Police Procedure', my: 'ရဲလက်စွဲနှင့် လုပ်ထုံးလုပ်နည်းများ' },
  'Penal Code': { en: 'Penal Code', my: 'ရာဇသတ်ကြီး ဥပဒေ' },
  'Civil Law': { en: 'Civil Law', my: 'တရားမ ဥပဒေ' },
  'Criminal Law': { en: 'Criminal Law', my: 'ရာဇဝတ် ဥပဒေ' },
  'Land Law': { en: 'Land Law', my: 'မြေယာ ဥပဒေ' },
  'Business Law': { en: 'Business Law', my: 'စီးပွားရေး ဥပဒေ' },
  'International Law': { en: 'International Law', my: 'အပြည်ပြည်ဆိုင်ရာ ဥပဒေ' },
  'Legal Rulings': { en: 'Legal Rulings', my: 'စီရင်ထုံးများ' },
  'Latest Updates': { en: 'Latest Updates', my: 'နောက်ဆုံးထွက် စာအုပ်များ' },
};

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
const PAGINATION_BLOCK_SIZE = 5;

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

interface AppProps {
  initialBooks?: LegalBook[];
  initialVisits?: number;
  initialPath?: string;
}

export default function App({ initialBooks = [], initialVisits = 0, initialPath = '/' }: AppProps) {
  const [books, setBooks] = useState<LegalBook[]>(initialBooks);
  const [loading, setLoading] = useState(initialBooks.length === 0);

  useEffect(() => {
    // If we have no books from SSR, try fetching them client-side
    if (books.length === 0) {
      setLoading(true);
      fetch('https://opensheet.elk.sh/1HCOpKGKhv_Ggm3r6dtvldqUynv5z6vLy98jjeOSrS4I/Sheet1')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const processedBooks = data.map((book: any, index: number) => {
              const id = book.id || String(index + 1);
              const driveIdMatch = (book.read || book.file || '').match(/[-\w]{25,}/);
              const driveId = driveIdMatch ? driveIdMatch[0] : null;
              
              let coverUrl = book.cover;
              if (coverUrl && coverUrl.includes('drive.google.com')) {
                const coverIdMatch = coverUrl.match(/[-\w]{25,}/);
                if (coverIdMatch) coverUrl = `https://lh3.googleusercontent.com/d/${coverIdMatch[0]}`;
              } else if (!coverUrl && driveId) {
                coverUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
              }
              
              if (!coverUrl) coverUrl = `https://picsum.photos/seed/${id}/400/600`;

              return {
                ...book,
                id: id,
                read: driveId ? `https://drive.google.com/file/d/${driveId}/preview` : book.read,
                file: driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : book.file,
                cover: coverUrl,
                featured: String(book.featured).toUpperCase() === 'TRUE'
              };
            });
            processedBooks.sort((a, b) => a.title.localeCompare(b.title, 'my'));
            setBooks(processedBooks);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch books client-side', err);
          setLoading(false);
        });
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [visitCount, setVisitCount] = useState(initialVisits);

  useEffect(() => {
    // Get initial visits from SSR if available
    const initialDataElement = document.getElementById('__INITIAL_DATA__');
    if (initialDataElement) {
      try {
        const initialData = JSON.parse(initialDataElement.textContent || '{}');
        if (initialData.visits) {
          setVisitCount(initialData.visits);
          return;
        }
      } catch (e) {
        console.error('Failed to parse hydration data', e);
      }
    }

    // Fallback to API fetch
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.visits) setVisitCount(data.visits);
      })
      .catch((err) => console.error('Failed to fetch stats', err));
  }, [initialVisits]);
  const [viewerTitle, setViewerTitle] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [touchedBookId, setTouchedBookId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['General Law']);
  const [isHydrated, setIsHydrated] = useState(false);
  const [readingStatus, setReadingStatus] = useState<Record<string, { read: boolean, lastPage?: number }>>(() => {
    if (typeof window === 'undefined') return {}; // SSR safety
    try {
      const saved = localStorage.getItem('mll-reading-progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const supportEmail = 'support@myanmarlegallibrary.com';

  useEffect(() => {
    localStorage.setItem('mll-reading-progress', JSON.stringify(readingStatus));
  }, [readingStatus]);

  const toggleReadStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReadingStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], read: !prev[id]?.read }
    }));
  };

  const updateLastPage = (id: string, page: number) => {
    setReadingStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], lastPage: page }
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const categoryGroups = {
    'General Law': ['All', 'Law & Constitution', 'Penal Code', 'Civil Law', 'Criminal Law'],
    'Specific Law': ['Police Procedure', 'Land Law', 'Business Law'],
    'International': ['International Law']
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const copyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'about' | 'privacy' | 'text-dictionary' | 'latest' | 'legal-rulings' | 'book-detail' | 'category-landing'>(() => {
    if (initialPath.startsWith('/book/')) return 'book-detail';
    if (initialPath === '/dictionary') return 'text-dictionary';
    if (initialPath === '/latest') return 'latest';
    if (initialPath === '/about') return 'about';
    if (initialPath === '/privacy') return 'privacy';
    if (initialPath === '/rulings') return 'legal-rulings';
    if (initialPath === '/books' || initialPath === '/library') return 'library';
    if (initialPath === '/penal-code' || initialPath === '/civil-law') return 'category-landing';
    return 'home';
  });

  const [selectedBookId, setSelectedBookId] = useState<string | null>(() => {
    if (initialPath.startsWith('/book/')) return initialPath.split('/book/')[1];
    return null;
  });

  const [landingCategory, setLandingCategory] = useState<string | null>(() => {
    if (initialPath === '/penal-code') return 'Penal Code';
    if (initialPath === '/civil-law') return 'Civil Law';
    return null;
  });

  // Handle URL routing
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/book/')) {
        const id = path.split('/book/')[1];
        setSelectedBookId(id);
        setCurrentView('book-detail');
      }
      else if (path === '/books' || path === '/library') setCurrentView('library');
      else if (path === '/dictionary') setCurrentView('text-dictionary');
      else if (path === '/latest') setCurrentView('latest');
      else if (path === '/about') setCurrentView('about');
      else if (path === '/privacy') setCurrentView('privacy');
      else if (path === '/rulings') setCurrentView('legal-rulings');
      else if (path === '/penal-code') {
        setLandingCategory('Penal Code');
        setCurrentView('category-landing');
      }
      else if (path === '/civil-law') {
        setLandingCategory('Civil Law');
        setCurrentView('category-landing');
      }
      else if (path === '/') setCurrentView('home');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (view: 'home' | 'library' | 'about' | 'privacy' | 'text-dictionary' | 'latest' | 'legal-rulings' | 'book-detail' | 'category-landing', id?: string) => {
    setCurrentView(view);
    let path = '/';
    if (view === 'library') path = '/books';
    else if (view === 'text-dictionary') path = '/dictionary';
    else if (view === 'legal-rulings') path = '/rulings';
    else if (view === 'book-detail' && id) {
      path = `/book/${id}`;
      setSelectedBookId(id);
    }
    else if (view === 'category-landing' && id) {
      setLandingCategory(id);
      path = `/${id.toLowerCase().replace(/\s+/g, '-')}`;
    }
    else if (view === 'home') path = '/';
    else path = `/${view}`;

    window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
    setIsSidebarOpen(false);
  };
  
  useEffect(() => {
    if (initialBooks.length > 0) return;

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
    const filtered = books.filter(book => {
      const lowerSearch = searchTerm.toLowerCase();
      
      // Bilingual search matching
      const matchesSearch = !searchTerm || 
        book.title.toLowerCase().includes(lowerSearch) || 
        book.author.toLowerCase().includes(lowerSearch) ||
        book.category.toLowerCase().includes(lowerSearch) ||
        (book.description && book.description.toLowerCase().includes(lowerSearch));
      
      const matchesYear = selectedYear === 'All' || book.year === selectedYear;
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const matchesLetter = selectedLetter === 'All' || book.title.trim().startsWith(selectedLetter);

      return matchesSearch && matchesYear && matchesCategory && matchesLetter;
    });

    // Only apply the complex locale sort if we are hydrated
    // This prevents mismatches between Node.js sort and Browser sort on initial render
    if (!isHydrated) return filtered;

    return [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'my'));
  }, [books, searchTerm, selectedYear, selectedCategory, selectedLetter, isHydrated]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedYear, selectedLetter]);

  const openReader = (url: string, title: string, id?: string) => {
    let finalUrl = url;
    if (id && readingStatus[id]?.lastPage) {
      // Append page fragment - many PDF viewers respond to #page=N
      finalUrl = `${url}#page=${readingStatus[id].lastPage}`;
    }
    setActivePdf(finalUrl);
    setViewerTitle(title);
    if (id) setActiveBookId(id);
    document.body.style.overflow = 'hidden';
  };

  const closeReader = () => {
    // If we have an active book and the viewer is closing, 
    // we ensure the latest page is persisted (though manual input is required for drive)
    setActivePdf(null);
    setActiveBookId(null);
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

  const rulingCount = useMemo(() => {
    return books.filter(book => 
      book.title.includes('စီရင်ထုံး') || 
      book.category.includes('စီရင်ထုံး') ||
      book.title.toLowerCase().includes('ruling') ||
      book.title.toLowerCase().includes('decision')
    ).length;
  }, [books]);

  const latestBooks = useMemo(() => {
    return [...books].reverse().slice(0, 5);
  }, [books]);

  // Pagination Block Logic
  const paginationRange = useMemo(() => {
    const currentGroup = Math.ceil(currentPage / PAGINATION_BLOCK_SIZE);
    const start = (currentGroup - 1) * PAGINATION_BLOCK_SIZE + 1;
    const end = Math.min(start + PAGINATION_BLOCK_SIZE - 1, totalPages);
    
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return { range, start, end };
  }, [currentPage, totalPages]);

  // Mobile Bottom Nav
  const navItems = [
    { id: 'home', icon: LayoutGrid, label: 'Home' },
    { id: 'library', icon: Book, label: 'Library' },
    { id: 'legal-rulings', icon: Gavel, label: 'Rulings' },
    { id: 'text-dictionary', icon: Globe, label: 'Lexicon' },
  ];

  return (
    <div className={`min-h-screen bg-off-white font-sans text-slate-900 pb-20 md:pb-0`}>
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
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('home')}
            className="flex items-center gap-2 md:gap-3 text-navy font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-navy text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform active:scale-95">
              <Scale className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-base md:text-lg font-black tracking-tighter">Myanmar Legal</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Library</span>
                <span className="hidden lg:block text-[10px] font-bold text-navy/40 font-myanmar uppercase tracking-tighter">
                  မြန်မာဥပဒေ စာအုပ်များ
                </span>
                {!loading && books.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-navy text-white text-[9px] md:text-[10px] font-bold rounded-md shadow-sm">
                    {books.length}
                  </span>
                )}
              </div>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'library', label: 'Library' },
              { id: 'legal-rulings', label: 'Rulings' },
              { id: 'text-dictionary', label: 'Dictionary' },
              { id: 'latest', label: 'Latest' }
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
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-navy hover:text-white transition-all active:scale-95 shadow-sm"
              aria-label="Open Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-xl md:hidden active:scale-95 text-slate-600"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex items-center justify-between md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id as any)}
            className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
          >
            <div className={`
              p-2 rounded-xl transition-all duration-300
              ${currentView === item.id ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'text-slate-400 group-hover:text-navy'}
            `}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${currentView === item.id ? 'text-navy' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage 
              onNavigate={navigate} 
              visitCount={visitCount} 
              bookCount={books.length}
              rulingCount={rulingCount}
              onRead={openReader}
              latestBooks={latestBooks}
            />
          </motion.div>
        ) : currentView === 'book-detail' && selectedBookId && books.find(b => b.id === selectedBookId) ? (
          <motion.div
            key="book-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BookDetail 
              book={books.find(b => b.id === selectedBookId)!} 
              onBack={() => navigate('library')}
              onOpenReader={openReader}
              readingStatus={readingStatus}
              onToggleRead={(id) => {
                setReadingStatus(prev => ({
                  ...prev,
                  [id]: { ...prev[id], read: !prev[id]?.read }
                }));
              }}
              bilingualCategory={CATEGORIES_BILINGUAL[books.find(b => b.id === selectedBookId)!.category]}
            />
          </motion.div>
        ) : currentView === 'category-landing' && landingCategory ? (
          <CategoryLandingPage 
            category={landingCategory}
            myanmarTitle={CATEGORIES_BILINGUAL[landingCategory]?.my || ''}
            description={
              landingCategory === 'Penal Code' ? 'Explore digitized copies of the Myanmar Penal Code and foundational enactments. Essential for legal research.' :
              landingCategory === 'Civil Law' ? 'A complete repository of Myanmar civil laws, procedures, and legal foundation codes.' :
              'Specialized legal document collection and archival repository.'
            }
            books={books}
            onBack={() => navigate('library')}
            onRead={openReader}
            onNavigateToBook={(id) => navigate('book-detail', id)}
          />
        ) : currentView === 'library' ? (
          <motion.div
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header section was here */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
              {/* Sidebar Backdrop */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                  />
                )}
              </AnimatePresence>

              {/* Sidebar */}
              <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 transform transition-transform duration-300 overflow-y-auto custom-scrollbar md:relative md:translate-x-0 md:bg-transparent md:border-none md:p-0 md:z-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}>
                <div className="mb-8 px-4">
                  <div className="text-xl font-black text-navy tracking-tight leading-none">MLL</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 font-myanmar leading-tight">
                    မြန်မာဥပဒေ စာအုပ်များ
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Primary Navigation */}
                  <div className="space-y-1">
                    {[
                      { id: 'home', label: 'Home', icon: Globe },
                      { id: 'library', label: 'Library', icon: Book },
                      { id: 'legal-rulings', label: 'Rulings', icon: Scale },
                      { id: 'text-dictionary', label: 'Dictionary', icon: Globe },
                      { id: 'latest', label: 'Latest', icon: Sparkles },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => navigate(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          currentView === item.id 
                            ? 'bg-navy text-white shadow-lg shadow-navy/20' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Categories */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-semibold text-slate-800">Categories</h3>
                    </div>
                    <div className="p-2 space-y-1">
                      {Object.entries(categoryGroups).map(([group, groupCats]) => (
                        <div key={group} className="space-y-1">
                          <button 
                            onClick={() => toggleGroup(group)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                          >
                            {group}
                            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${expandedGroups.includes(group) ? 'rotate-90' : ''}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {expandedGroups.includes(group) && (
                              <motion.ul 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-1"
                              >
                                {groupCats.map(cat => {
                                  const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS['Default'];
                                  const bilingual = CATEGORIES_BILINGUAL[cat];
                                  return (
                                    <li key={cat}>
                                      <button
                                        onClick={() => {
                                          setSelectedCategory(cat);
                                          setIsSidebarOpen(false);
                                          if (currentView !== 'library') navigate('library');
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                          selectedCategory === cat 
                                            ? 'bg-navy/5 text-navy shadow-sm' 
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        <Icon className={`w-4 h-4 ${selectedCategory === cat ? 'text-navy' : 'text-slate-400'}`} />
                                        <div className="flex flex-col items-start leading-tight">
                                          <span>{cat}</span>
                                          {bilingual && <span className="text-[9px] opacity-70 font-myanmar">{bilingual.my}</span>}
                                        </div>
                                      </button>
                                    </li>
                                  );
                                })}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {/* Featured Section in Library */}
                <AnimatePresence>
                  {!loading && featuredBooks.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
                    <motion.section 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-12"
                    >
                      <div className="relative overflow-hidden rounded-[2.5rem] bg-navy text-white p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                          <Scale className="w-full h-full -rotate-12 translate-x-1/4" />
                        </div>
                        <div className="relative z-10 max-w-xl">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/20">
                            <Sparkles className="w-3 h-3 text-slate-300" />
                            Featured
                          </div>
                          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
                            {featuredBooks[0].title}
                          </h2>
                          <div className="flex flex-wrap gap-4 mt-8">
                            <button 
                              onClick={() => openReader(featuredBooks[0].read, featuredBooks[0].title)}
                              className="px-6 py-3 bg-white text-navy rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                              <BookOpen className="w-4 h-4" />
                              Read Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Myanmar Legal Library</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>Home</span>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-slate-600 font-medium">{selectedCategory === 'All' ? 'All Books' : selectedCategory}</span>
                    </div>
                  </div>
                  {!loading && (
                    <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">
                      {filteredBooks.length} Results
                    </span>
                  )}
                </div>

                {/* Library Search */}
                <div className="mb-8">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-navy transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search legal books, codes, and documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-0 focus:border-navy outline-none transition-all shadow-sm text-lg"
                    />
                  </div>
                </div>

                {/* Book Grid */}
                {paginatedBooks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                      {paginatedBooks.map((book) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={book.id}
                          onClick={() => navigate('book-detail', book.id)}
                          className="group flex flex-col bg-white rounded-xl md:rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-navy/20 md:bg-gradient-to-t md:from-black/60 md:via-transparent md:to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {book.featured && (
                              <div className="absolute top-2 left-2 md:top-4 md:left-4 px-2 py-0.5 md:px-3 md:py-1.5 bg-navy/90 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl z-20">
                                Featured
                              </div>
                            )}

                            {/* Overlay Actions */}
                            <div className={`hidden md:flex absolute inset-0 transition-all duration-500 items-center justify-center gap-4 p-6 ${
                              touchedBookId === book.id 
                                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                                : 'opacity-0 translate-y-4 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto'
                            }`}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('book-detail', book.id);
                                }}
                                className="w-14 h-14 bg-white text-navy rounded-2xl flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-2xl active:scale-90"
                              >
                                <Info className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReader(book.read, book.title, book.id);
                                }}
                                className="w-14 h-14 bg-white text-navy rounded-2xl flex items-center justify-center hover:bg-navy hover:text-white transition-all shadow-2xl active:scale-90"
                              >
                                <BookOpen className="w-6 h-6" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3 md:p-6 flex flex-col flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-2 md:mb-3">
                              <span className="px-1.5 py-0.5 md:px-2.5 md:py-1 bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest rounded-md border border-slate-100">
                                {book.category}
                              </span>
                              <span className="text-[8px] md:text-[9px] font-bold text-navy/40 uppercase tracking-widest">{book.year}</span>
                            </div>
                            
                            <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 md:mb-2 group-hover:text-navy transition-colors leading-tight text-sm md:text-lg flex-1">
                              {book.title}
                            </h3>
                            
                            <p className="text-[10px] md:text-sm text-slate-400 mb-3 md:mb-6 font-medium line-clamp-1">By {book.author}</p>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openReader(book.read, book.title, book.id);
                              }}
                              className="md:hidden mt-auto w-full py-2.5 md:py-3 bg-navy text-white rounded-xl text-[10px] md:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Read
                            </button>

                            <div className="hidden md:flex pt-4 border-t border-slate-50 items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => toggleReadStatus(e, book.id)}
                                  className={`p-2 rounded-lg transition-all flex items-center gap-1.5 ${
                                    readingStatus[book.id]?.read 
                                      ? 'bg-muted-green/10 text-muted-green' 
                                      : 'bg-slate-50 text-slate-300 hover:text-navy hover:bg-slate-100'
                                  }`}
                                  title={readingStatus[book.id]?.read ? "Mark as unread" : "Mark as read"}
                                >
                                  <CheckCircle2 className={`w-4 h-4 ${readingStatus[book.id]?.read ? 'fill-muted-green/20' : ''}`} />
                                  {readingStatus[book.id]?.read && <span className="text-[10px] font-bold uppercase tracking-wider">Read</span>}
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openReader(book.read, book.title, book.id);
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

                    {/* Range-Based Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, paginationRange.start - 1))}
                            disabled={paginationRange.start === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm font-bold text-xs uppercase tracking-widest"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                          </button>
                          
                          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                            {paginationRange.range.map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                  currentPage === page
                                    ? 'bg-navy text-white shadow-lg shadow-slate-200 scale-110 z-10'
                                    : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-navy shadow-sm'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, paginationRange.end + 1))}
                            disabled={paginationRange.end === totalPages}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm font-bold text-xs uppercase tracking-widest"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                          Showing {paginationRange.start}-{paginationRange.end} of {totalPages} Pages
                        </div>
                      </div>
                    )}

                    {/* Book Request CTA */}
                    <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-100">
                          <BookPlus className="w-8 h-8 text-navy" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 mb-1">Can't find a specific book?</h4>
                          <p className="text-sm text-slate-500">Request any legal document and we'll try to find it for you.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="px-8 py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 flex items-center gap-2 active:scale-95"
                      >
                        <Send className="w-5 h-5" />
                        Request Now
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <Book className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">Try adjusting your search or filters to find what you're looking for.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={resetFilters}
                        className="px-6 py-2.5 bg-navy text-white rounded-xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-slate-200"
                      >
                        Clear All Filters
                      </button>
                      <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                      >
                        Request a Book
                      </button>
                    </div>
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
        ) : currentView === 'legal-rulings' ? (
          <LegalRulings books={books} onBack={() => navigate('library')} onRead={openReader} />
        ) : (
          <PrivacyPolicy onBack={() => navigate('library')} />
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-white p-4 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-navy transition-colors" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search legal resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsSearchOpen(false); }}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-navy/5 text-lg font-medium"
                />
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-4 bg-slate-100 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Links</div>
              <div className="grid grid-cols-2 gap-3">
                {['Penal Code', 'Constitution', 'Civil Law', 'Criminal Law'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => { setSearchTerm(tag); setIsSearchOpen(false); if(currentView !== 'library') navigate('library'); }}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-navy hover:text-white transition-all group"
                  >
                    <div className="text-sm font-bold truncate">{tag}</div>
                    <div className="text-[10px] opacity-60 font-medium group-hover:opacity-80">Quick search</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
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
            <div className="h-16 md:h-20 bg-slate-800 px-4 md:px-6 flex items-center justify-between text-white border-b border-slate-700 shadow-xl">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button 
                  onClick={closeReader}
                  className="p-2 hover:bg-slate-700 rounded-xl transition-colors md:hidden"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-xs md:text-base truncate max-w-[150px] sm:max-w-md">{viewerTitle}</h3>
                  <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <BookOpen className="w-2.5 h-2.5" />
                    Reader Mode
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                {activeBookId && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900/50 px-2 py-1 md:px-3 md:py-1.5 rounded-xl border border-slate-600/50">
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Pg"
                      value={readingStatus[activeBookId]?.lastPage || ''}
                      onChange={(e) => updateLastPage(activeBookId, parseInt(e.target.value) || 0)}
                      className="w-8 md:w-16 bg-transparent text-white text-[10px] md:text-xs font-bold outline-none text-center"
                    />
                    <div className="h-3 md:h-4 w-px bg-slate-600" />
                    <button 
                      onClick={(e) => toggleReadStatus(e as any, activeBookId)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${
                        readingStatus[activeBookId]?.read 
                        ? 'text-muted-green bg-muted-green/10' 
                        : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${readingStatus[activeBookId]?.read ? 'fill-muted-green/20' : ''}`} />
                      <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider">
                        {readingStatus[activeBookId]?.read ? 'Done' : 'Mark'}
                      </span>
                    </button>
                  </div>
                )}
                <button 
                  onClick={closeReader}
                  className="hidden md:flex p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800 relative">
              <iframe 
                src={activePdf} 
                className="w-full h-full border-none"
                title="PDF Viewer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-navy text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6 rotate-90" />
          </motion.button>
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
                    className="font-black text-navy tracking-tight text-xl transition-colors hover:opacity-80"
                  >
                    Myanmar Legal Library
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                  Your digital gateway to Myanmar's legal knowledge. Empowering citizens and professionals with accessible legal resources.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-[0.2em]">Resources</h4>
                  <ul className="space-y-3 text-sm text-slate-600 font-bold">
                    <li><a href="#" className="hover:text-navy transition-colors">Constitution</a></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Civil Law</a></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Criminal Law</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-[0.2em]">Library</h4>
                  <ul className="space-y-3 text-sm text-slate-600 font-bold">
                    <li><button onClick={() => navigate('latest')} className="hover:text-navy transition-colors">Latest Updates</button></li>
                    <li><button onClick={() => navigate('text-dictionary')} className="hover:text-navy transition-colors text-left">English - Myanmar Law Dictionary</button></li>
                    <li><button onClick={() => navigate('about')} className="hover:text-navy transition-colors">About Us</button></li>
                    <li><a href="#" className="hover:text-navy transition-colors">Contact</a></li>
                    <li><button onClick={() => navigate('privacy')} className="hover:text-navy transition-colors">Privacy Policy</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-6 text-xs uppercase tracking-[0.2em]">Support</h4>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <a href={`mailto:${supportEmail}`} className="text-sm text-navy font-bold hover:underline flex items-center gap-2">
                        <Mail className="w-5 h-5" />
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

      <RequestBookForm 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
}
