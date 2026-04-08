import { motion } from 'motion/react';
import { Shield, ArrowLeft, Mail, Lock, Eye, FileText, Clock } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const lastUpdated = 'April 8, 2026';
  const email = 'support@myanmarlegallibrary.com';

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
        {/* Header */}
        <div className="bg-navy text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <Shield className="w-full h-full -rotate-12 translate-x-1/4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-300 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Last Updated: {lastUpdated}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-slate-200 text-lg max-w-2xl leading-relaxed">
              ကိုယ်ရေးအချက်အလက် ထိန်းသိမ်းမှု မူဝါဒ - Your privacy and data security are our top priorities.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12 text-[16px]">
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-navy rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              နိဒါန်း (Introduction)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-slate-600">
              <div className="space-y-4">
                <p>
                  Myanmar Legal Library မှ ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများကို အသုံးပြုသူများ၏ ကိုယ်ရေးအချက်အလက် လုံခြုံမှုကို အလေးထားပါသည်။ ဤမူဝါဒသည် ကျွန်ုပ်တို့မှ အချက်အလက်များကို မည်သို့ကိုင်တွယ်သည်ကို ရှင်းလင်းတင်ပြထားခြင်း ဖြစ်ပါသည်။
                </p>
              </div>
              <div className="space-y-4 border-l border-slate-100 pl-8">
                <p>
                  At Myanmar Legal Library, we value the privacy of our users. This policy explains how we handle information and ensure your digital safety while using our platform.
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-navy rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              အချက်အလက် စုဆောင်းခြင်း (Data Collection)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-slate-600">
              <div className="space-y-4">
                <p>
                  ကျွန်ုပ်တို့သည် အသုံးပြုသူများထံမှ မလိုအပ်သော ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို စုဆောင်းခြင်း မပြုလုပ်ပါ။ စာအုပ်များကို အခမဲ့ ဒေါင်းလုဒ်ရယူရန်အတွက် မည်သည့် မှတ်ပုံတင်ခြင်းမှ ပြုလုပ်ရန် မလိုအပ်ပါ။
                </p>
              </div>
              <div className="space-y-4 border-l border-slate-100 pl-8">
                <p>
                  We do not collect unnecessary personal information from our users. No registration is required to browse or download legal resources from our library.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-navy rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              ကွတ်ကီးများ (Cookies)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-slate-600">
              <div className="space-y-4">
                <p>
                  ဝဘ်ဆိုက်၏ လုပ်ဆောင်ချက်များ ပိုမိုကောင်းမွန်စေရန်အတွက် အခြေခံ ကွတ်ကီး (Cookies) အချို့ကိုသာ အသုံးပြုနိုင်ပါသည်။ ၎င်းတို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို သိမ်းဆည်းခြင်း မပြုပါ။
                </p>
              </div>
              <div className="space-y-4 border-l border-slate-100 pl-8">
                <p>
                  We may use basic cookies to enhance website functionality. These cookies do not store personal identification data and are used solely for improving user experience.
                </p>
              </div>
            </div>
          </section>

          {/* Third Party */}
          <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">ပြင်ပလင့်ခ်များ (Third-party Links)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 leading-relaxed text-sm">
              <p>
                ကျွန်ုပ်တို့၏ စာအုပ်များကို Google Drive တွင် သိမ်းဆည်းထားပါသည်။ ထို့ကြောင့် ဒေါင်းလုဒ်ရယူချိန်တွင် Google ၏ ကိုယ်ရေးအချက်အလက် မူဝါဒများနှင့် သက်ဆိုင်နိုင်ပါသည်။
              </p>
              <p>
                Our files are hosted on Google Drive. When downloading, you may be subject to Google's privacy terms and conditions.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-8 border-t border-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">မေးမြန်းရန်များ (Contact Us)</h3>
              <p className="text-slate-500 max-w-md">
                ကိုယ်ရေးအချက်အလက် မူဝါဒနှင့် ပတ်သက်၍ သိရှိလိုပါက အောက်ပါ အီးမေးလ်မှတဆင့် ဆက်သွယ်နိုင်ပါသည်။
              </p>
              <a 
                href={`mailto:${email}`}
                className="text-navy font-bold text-lg hover:underline"
              >
                {email}
              </a>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
