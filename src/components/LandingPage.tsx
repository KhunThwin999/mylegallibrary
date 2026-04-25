import { motion } from 'motion/react';
import { 
  Scale, 
  BookOpen, 
  Search, 
  Shield, 
  Gavel, 
  Globe, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Database,
  Users,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: any, id?: string) => void;
  visitCount: number;
  bookCount: number;
  rulingCount: number;
  onRead: (url: string, title: string, id: string) => void;
  latestBooks?: any[];
}

function MiniBookCard({ book, onRead, onNavigate }: { book: any, onRead: any, onNavigate: any }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <img 
          src={book.cover} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 p-4 text-center">
          <button 
            onClick={() => onNavigate('book-detail', book.id)}
            className="px-4 py-2 bg-white text-navy font-bold rounded-lg text-xs"
          >
            Details
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-[10px] font-bold text-navy/40 uppercase tracking-widest mb-1">{book.category}</div>
        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-2 group-hover:text-navy transition-colors">
          {book.title}
        </h4>
        <button 
          onClick={() => onRead(book.read, book.title, book.id)}
          className="mt-auto w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy hover:text-white transition-all"
        >
          Read Now
        </button>
      </div>
    </motion.div>
  );
}

export default function LandingPage({ 
  onNavigate, 
  visitCount, 
  bookCount, 
  rulingCount, 
  onRead,
  latestBooks = [] 
}: LandingPageProps) {
  const stats = [
    { 
      label: 'Legal Resources', 
      value: bookCount > 0 ? bookCount.toLocaleString() + '+' : 'Active', 
      icon: Database 
    },
    { 
      label: 'Estimated Users', 
      value: visitCount > 0 ? (Math.round(visitCount * 0.75)).toLocaleString() + '+' : 'Live', 
      icon: Users 
    },
    { 
      label: 'Court Rulings', 
      value: rulingCount > 0 ? rulingCount.toLocaleString() : 'Growing', 
      icon: Gavel 
    },
    { 
      label: 'Total Visits', 
      value: visitCount > 0 ? visitCount.toLocaleString() : 'Daily', 
      icon: Sparkles 
    },
  ];

  const features = [
    {
      title: "Penal Code Collection",
      desc: "Access the full Myanmar Penal Code and related criminal law enactments.",
      myDesc: "မြန်မာနိုင်ငံ ရာဇသတ်ကြီး ဥပဒေ စာအုပ်များ။",
      icon: Gavel,
      color: "bg-rose-400", // Toned down saturation
      view: 'category-landing',
      id: 'Penal Code'
    },
    {
      title: "Civil Law Repository",
      desc: "Explore comprehensive civil codes, procedures, and legal foundation materials.",
      myDesc: "မြန်မာနိုင်ငံ တရားမ ဥပဒေ စာအုပ်များ။",
      icon: Scale,
      color: "bg-amber-400", // Toned down saturation
      view: 'category-landing',
      id: 'Civil Law'
    },
    {
      title: "Technical Dictionary",
      desc: "English-Myanmar legal dictionary specifically designed for legal professionals.",
      myDesc: "ဥပဒေဝေါဟာရ အဘိဓာန်",
      icon: Globe,
      color: "bg-emerald-400", // Toned down saturation
      view: 'text-dictionary'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy/5 text-navy rounded-full text-[10px] font-bold uppercase tracking-widest border border-navy/10">
              <Sparkles className="w-3 h-3" />
              Myanmar's Digital Legal Gateway
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Myanmar Legal Library: <span className="text-navy">Access the Logic of the Law.</span>
            </h1>
            <div className="text-sm md:text-base font-black text-navy/70 uppercase tracking-[0.1em] font-myanmar">
              မြန်မာဥပဒေ စာအုပ်များ (Myanmar Law Books)
            </div>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
              Access the most comprehensive <span className="text-navy font-bold">Myanmar law book</span> collection. A centralized digital repository providing free, open access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('library')}
                className="w-full sm:w-auto px-10 py-4 md:py-5 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 hover:shadow-2xl hover:shadow-navy/30 transition-all shadow-xl shadow-navy/20 flex items-center justify-center gap-2 group active:scale-95"
              >
                Browse Books
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('legal-rulings')}
                className="w-full sm:w-auto px-10 py-4 md:py-5 bg-white text-navy border-2 border-navy/20 rounded-2xl font-bold hover:bg-navy/5 hover:border-navy transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                View Rulings
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Defined Box with blur and subtler shadows */}
            <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-200/60 italic font-medium text-slate-500 leading-loose">
              "The law is a shield for the innocent and a sword against the unjust. Access to it should be universal, transparent, and immediate."
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center border border-navy/10">
                  <Scale className="w-6 h-6 text-navy" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 not-italic tracking-tight">Justice & Transparency</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest not-italic">Our Core Foundation</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-navy rounded-[3rem] -z-10 rotate-6 opacity-5" />
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500 rounded-full -z-10 opacity-10 blur-3xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center space-y-3"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                  <stat.icon strokeWidth={2.5} className="w-6 h-6 text-navy" />
                </div>
                <div className="text-4xl font-black text-navy tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Books Section */}
      {latestBooks.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  New Additions
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Latest Legal Books</h2>
                <p className="text-slate-500 max-w-xl">Recently digitized and added to our library. Always free and accessible.</p>
              </div>
              <button 
                onClick={() => onNavigate('library')}
                className="flex items-center gap-2 text-navy font-bold hover:gap-3 transition-all group"
              >
                View Full Library <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {latestBooks.slice(0, 5).map((book, idx) => (
                <MiniBookCard 
                  key={book.id} 
                  book={book} 
                  onRead={onRead} 
                  onNavigate={onNavigate} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-20 space-y-4">
            <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tight">Search for <span className="text-navy">မြန်မာဥပဒေ စာအုပ်များ</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg">Digitized, searchable, and always available. The premier <span className="text-navy font-bold">Myanmar law book</span> gateway.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate(feature.view as any, (feature as any).id)}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 md:mb-10 text-white group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-current/10`}>
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-3 md:mb-4 text-xs md:text-sm">{feature.desc}</p>
                <p className="text-navy font-black font-myanmar text-base md:text-lg leading-relaxed mb-6 md:mb-8">{feature.myDesc}</p>
                <div className="flex items-center gap-2 text-navy font-black text-[10px] md:text-xs uppercase tracking-widest pt-4 border-t border-slate-50">
                  Enter Collection <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CJA / Mission Section */}
      <section className="py-20 md:py-32 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-8 md:space-y-10">
            <h2 className="text-3xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Our Mission:<br />
              <span className="text-navy">Digital Rule of Law</span>
            </h2>
            <div className="space-y-5 md:space-y-6">
              {[
                "Digitize all foundational laws of Myanmar",
                "Provide a searchable database of legal vocabulary",
                "Centralize court rulings for case law study",
                "Free access for all citizens and students"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 strokeWidth={3} className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-bold text-base md:text-lg">{item}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('about')}
              className="w-full sm:w-auto px-10 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Read Our Full Mission
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative lg:pl-10 mt-12 lg:mt-0">
            <div className="aspect-square bg-navy rounded-[3rem] md:rounded-[4rem] p-10 md:p-16 relative overflow-hidden flex flex-col justify-end shadow-2xl shadow-navy/20">
              <Scale className="absolute -top-12 -right-12 w-64 md:w-80 h-64 md:h-80 text-white/5" />
              <div className="relative z-10 space-y-4 md:space-y-6">
                <div className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                  Transparent.<br />
                  Accessible.<br />
                  Permanent.
                </div>
                <div className="h-2 w-20 md:w-24 bg-amber-500 rounded-full" />
              </div>
            </div>
            {/* Repositioned Box: Lower and slightly left to not obscure the text */}
            <div className="absolute -bottom-10 -left-6 md:-left-12 w-56 h-56 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-center gap-3 active:scale-95 transition-transform cursor-default">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-4xl font-black text-navy leading-none">100%</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-tight">Digital Access Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 md:py-40 bg-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 space-y-8 md:space-y-10 relative z-10"
        >
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">Ready to dive in?</h2>
          <p className="text-slate-300 text-lg md:text-xl opacity-80 leading-relaxed max-w-2xl mx-auto">
            Start searching through hundreds of legal books, codes, and documents today. Open-access for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-6">
            <button 
              onClick={() => onNavigate('library')}
              className="w-full sm:w-auto px-12 py-4 md:py-6 bg-white text-navy rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-2xl shadow-black/30 hover:shadow-white/20 active:scale-95"
            >
              Start Reading Now
            </button>
            <button 
              onClick={() => onNavigate('text-dictionary')}
              className="w-full sm:w-auto px-12 py-4 md:py-6 bg-white/10 backdrop-blur-md text-white border-2 border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
            >
              Legal Dictionary
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
