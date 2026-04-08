import { motion } from 'motion/react';
import { Scale, Shield, Smartphone, Zap, Search, Mail, ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const [copied, setCopied] = useState(false);
  const email = 'support@myanmarlegallibrary.com';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-navy font-bold mb-8 hover:gap-3 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Library
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        {/* Hero Header */}
        <div className="bg-navy text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <Scale className="w-full h-full -rotate-12 translate-x-1/4" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">About Us</h1>
            <p className="text-slate-200 text-lg max-w-2xl leading-relaxed">
              Myanmar Legal Library: Bridging the gap between traditional law books and digital convenience.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-navy rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              ကျွန်ုပ်တို့အကြောင်း (About Us)
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">
                Myanmar Legal Library မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။
              </p>
              <p>
                ကျွန်ုပ်တို့သည် မြန်မာနိုင်ငံ၏ ဥပဒေများ၊ နည်းဥပဒေများနှင့် လုပ်ထုံးလုပ်နည်းများကို တစ်နေရာတည်းတွင် အလွယ်တကူ ရှာဖွေဖတ်ရှုနိုင်ရန် ရည်ရွယ်၍ တည်ထောင်ထားသော ဒစ်ဂျစ်တယ်စာကြည့်တိုက်ဖြစ်ပါသည်။
              </p>
              <p className="text-sm border-l-4 border-slate-200 pl-4 italic">
                Welcome to Myanmar Legal Library, a digital repository for Myanmar laws and manuals (Police Manual, Private Security Law, etc.).
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">ကျွန်ုပ်တို့၏ ရည်မှန်းချက် (Our Mission)</h3>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                ဥပဒေပညာရှင်များ၊ ကျောင်းသား/ကျောင်းသူများနှင့် ပြည်သူအများစုအနေဖြင့် မိမိတို့သိရှိလိုသော ဥပဒေအချက်အလက်များကို အချိန်မရွေး၊ နေရာမရွေး လွယ်ကူစွာ ရှာဖွေနိုင်ရန်မှာ အလွန်အရေးကြီးပါသည်။ ကျွန်ုပ်တို့သည် ရဲလက်စွဲဥပဒေများ၊ ကိုယ်ပိုင်လုံခြုံရေးဝန်ဆောင်မှုဥပဒေများ နှင့် အခြားအရေးကြီးသော နိုင်ငံတော်ဥပဒေများကို ဒစ်ဂျစ်တယ်စနစ်ဖြင့် စနစ်တကျ စုစည်းပေးထားပါသည်။
              </p>
              <p className="text-sm opacity-75">
                Our mission is to provide easy access to legal information for legal professionals, students, and the general public anytime, anywhere. We systematically organize digital versions of police manuals, private security laws, and other critical state laws.
              </p>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">Myanmar Legal Library ကို ဘာကြောင့် ရွေးချယ်သင့်သလဲ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 text-muted-green rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">၁၀၀% အခမဲ့</h4>
                <p className="text-sm text-slate-500">ဝဘ်ဆိုက်ပေါ်ရှိ ဥပဒေစာအုပ်များအားလုံးကို အခမဲ့ (Free PDF Download) ရယူနိုင်ပါသည်။</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">100% Free Access</p>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-100 text-navy rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">ဖုန်းဖြင့်ကြည့်ရှုရန် အဆင်ပြေခြင်း</h4>
                <p className="text-sm text-slate-500">မိုဘိုင်းဖုန်းဖြင့် အသုံးပြုရာတွင် အလွန်မြန်ဆန်ပြီး ကြည့်ရှုရ အဆင်ပြေစေရန် အထူးစီမံထားပါသည်။</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Mobile-First Design</p>
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-100 text-slate-gray rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">စနစ်တကျ ရှာဖွေနိုင်ခြင်း</h4>
                <p className="text-sm text-slate-500">အက္ခရာစဉ်အလိုက် နှင့် ရှာဖွေရေးစနစ် ပါဝင်သောကြောင့် အလွယ်တကူ ရှာဖွေနိုင်ပါသည်။</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Organized & Searchable</p>
              </div>
            </div>
          </section>

          {/* Removal Policy */}
          <section className="bg-rose-50 rounded-3xl p-8 border border-rose-100">
            <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              မူပိုင်ခွင့်နှင့် စာအုပ်များ ပြန်လည်ဖျက်သိမ်းပေးရန် တောင်းဆိုခြင်း (Removal Request)
            </h3>
            <div className="space-y-4 text-rose-800/80 leading-relaxed text-sm">
              <p>
                ကျွန်ုပ်တို့ Myanmar Legal Library အနေဖြင့် ဥပဒေဗဟုသုတများ ပြန့်ပွားစေရန် ရည်ရွယ်၍ စုစည်းတင်ပြထားခြင်း ဖြစ်ပါသည်။ အကယ်၍ သင်သည် မူပိုင်ခွင့်ပိုင်ရှင်ဖြစ်ပြီး ကျွန်ုပ်တို့ ဝဘ်ဆိုက်တွင် တင်ထားသော စာအုပ်များထဲမှ မိမိတို့ မတင်စေလိုသော (သို့မဟုတ်) ပြန်လည်ဖြုတ်ချစေလိုသော စာအုပ်များရှိပါက ကျွန်ုပ်တို့ထံ တိုက်ရိုက်ဆက်သွယ် အကြောင်းကြားနိုင်ပါသည်။ အကြောင်းကြားစာ ရရှိသည်နှင့် တပြိုင်နက် သက်ဆိုင်ရာ စာအုပ်ကို အမြန်ဆုံး ပြန်လည်ဖျက်သိမ်း (Remove) ပေးသွားမည်ဖြစ်ကြောင်း အသိပေးအပ်ပါသည်။
              </p>
              <p className="font-medium border-t border-rose-200 pt-4">
                If you are a copyright owner and wish to have your content removed, please contact us. We will immediately delete the requested material upon verification.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <Mail className="w-4 h-4" />
                  <span>Contact: {email}</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-900 rounded-lg text-xs font-bold hover:bg-rose-200 transition-all w-fit"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
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
          </section>
        </div>
      </div>
    </motion.div>
  );
}
