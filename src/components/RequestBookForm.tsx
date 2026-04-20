import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, BookPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RequestBookFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestBookForm({ isOpen, onClose }: RequestBookFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bookTitle: '',
    details: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookTitle.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/request-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', bookTitle: '', details: '' });
      } else {
        throw new Error(result.error || 'Failed to send request');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-navy text-white p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <BookPlus className="w-full h-full -rotate-12 translate-x-1/4" />
              </div>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                  <BookPlus className="w-6 h-6 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Request a Book</h2>
                <p className="text-slate-300 text-sm mt-1">Can't find a specific document? Let us know.</p>
              </div>
            </div>

            <div className="p-8">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent Successfully!</h3>
                  <p className="text-slate-500 text-sm mb-8">
                    Thank you for your contribution. We will look for this book and add it to our library as soon as possible.
                  </p>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg shadow-navy/20"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Book Title / Law Name *
                    </label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. The Evidence Act 1872"
                      value={formData.bookTitle}
                      onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none transition-all placeholder:text-slate-300 text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Your Name
                      </label>
                      <input 
                        type="text"
                        placeholder="Optional"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none transition-all placeholder:text-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Email Address
                      </label>
                      <input 
                        type="email"
                        placeholder="Optional"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none transition-all placeholder:text-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Additional Details
                    </label>
                    <textarea 
                      placeholder="Any specific version, year, or detail that helps us find the right document..."
                      rows={3}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-navy/5 focus:border-navy outline-none transition-all placeholder:text-slate-300 text-slate-900 resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-100">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  <button 
                    disabled={status === 'loading'}
                    type="submit"
                    className="w-full py-4 bg-navy text-white rounded-2xl font-bold hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-navy/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
