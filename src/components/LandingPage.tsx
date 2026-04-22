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
}

export default function LandingPage({ onNavigate, visitCount }: LandingPageProps) {
  const stats = [
    { label: 'Legal Resources', value: '500+', icon: Database },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Court Rulings', value: '2K+', icon: Gavel },
    { label: 'Daily Visits', value: visitCount.toLocaleString(), icon: Sparkles },
  ];

  const features = [
    {
      title: "Penal Code Collection",
      desc: "Access the full Myanmar Penal Code and related criminal law enactments. မြန်မာနိုင်ငံ ရာဇသတ်ကြီး ဥပဒေ စာအုပ်များ။",
      icon: Gavel,
      color: "bg-rose-500",
      view: 'category-landing',
      id: 'Penal Code'
    },
    {
      title: "Civil Law Repository",
      desc: "Explore comprehensive civil codes, procedures, and legal foundation materials. မြန်မာနိုင်ငံ တရားမ ဥပဒေ စာအုပ်များ။",
      icon: Scale,
      color: "bg-amber-500",
      view: 'category-landing',
      id: 'Civil Law'
    },
    {
      title: "Technical Dictionary",
      desc: "English-Myanmar legal dictionary specifically designed for legal professionals and students.",
      icon: Globe,
      color: "bg-emerald-500",
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

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy/5 text-navy rounded-full text-[10px] font-bold uppercase tracking-widest border border-navy/10">
              <Sparkles className="w-3 h-3" />
              Myanmar's Digital Legal Gateway
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Myanmar Legal Library: <span className="text-navy">Access the Logic of the Law.</span>
            </h1>
            <div className="text-sm font-bold text-navy/60 uppercase tracking-[0.2em] font-myanmar">
              မြန်မာဥပဒေ စာအုပ်များ (Myanmar Law Books)
            </div>
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              Access the most comprehensive <span className="text-navy font-bold">Myanmar law book</span> collection. A centralized digital repository providing free, open access to the nation's legal heritage.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onNavigate('library')}
                className="px-8 py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-xl shadow-navy/20 flex items-center gap-2 group active:scale-95"
              >
                Browse Books
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('legal-rulings')}
                className="px-8 py-4 bg-white text-navy border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
              >
                View Rulings
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 border border-slate-100 italic font-medium text-slate-500 leading-loose">
              "The law is a shield for the innocent and a sword against the unjust. Access to it should be universal, transparent, and immediate."
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5 text-navy" />
                </div>
                <div className="text-sm font-bold text-slate-900 not-italic">Justice & Transparency</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-navy rounded-3xl -z-10 rotate-12 opacity-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-500 rounded-full -z-10 opacity-10 blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-navy" />
                </div>
                <div className="text-3xl font-black text-navy tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Search for <span className="text-navy">မြန်မာဥပဒေ စာအုပ်များ</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Digitized, searchable, and always available. The premier <span className="text-navy font-bold">Myanmar law book</span> gateway.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate(feature.view as any, (feature as any).id)}
                className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-8 text-white group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6">{feature.desc}</p>
                <div className="flex items-center gap-2 text-navy font-bold text-sm">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CJA / Mission Section */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Our Mission:<br />
              Digital Rule of Law
            </h2>
            <div className="space-y-6">
              {[
                "Digitize all foundational laws of Myanmar",
                "Provide a searchable database of legal vocabulary",
                "Centralize court rulings for case law study",
                "Free access for all citizens and legal students"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('about')}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              Read Our Full Mission
            </button>
          </div>

          <div className="relative">
            <div className="aspect-square bg-navy rounded-[3rem] p-12 relative overflow-hidden flex flex-col justify-end">
              <Scale className="absolute -top-10 -right-10 w-64 h-64 text-white/10" />
              <div className="relative z-10 space-y-4">
                <div className="text-4xl font-black text-white leading-tight">
                  Transparent.<br />
                  Accessible.<br />
                  Permanent.
                </div>
                <div className="h-1.5 w-16 bg-amber-500 rounded-full" />
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-2xl flex flex-col justify-center gap-2">
              <div className="text-3xl font-black text-navy">100%</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">Digital Access Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-navy text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4 space-y-8"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Ready to dive into the library?</h2>
          <p className="text-slate-300 text-lg opacity-80 leading-relaxed">
            Start searching through hundreds of legal books, codes, and documents today. No registration required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => onNavigate('library')}
              className="px-12 py-5 bg-white text-navy rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-2xl shadow-black/20 active:scale-95"
            >
              Start Reading Now
            </button>
            <button 
              onClick={() => onNavigate('text-dictionary')}
              className="px-12 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
            >
              Legal Dictionary
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
