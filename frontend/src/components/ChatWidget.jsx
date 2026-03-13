import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, RefreshCw } from 'lucide-react';
import { chatAPI } from '../api/endpoints';
import { useLanguage } from '../contexts/LanguageContext';

const WelcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! I\'m your AI assistant. Ask me anything about our content, jobs, news, or blogs.',
  timestamp: new Date()
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WelcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { activeLanguage } = useLanguage();

  const languageCode = activeLanguage?.code || 'en';

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const { data } = await chatAPI.send({ message: text, language: languageCode, topK: 5 });
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.data?.response || 'Sorry, I could not generate a response.',
        sources: data.data?.sources || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reach the AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WelcomeMessage]);
    setError(null);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[520px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Bot size={16} className="text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Assistant</p>
                  <p className="text-xs text-slate-400">Powered by local AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                    ${msg.role === 'user' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === 'user'
                        ? 'bg-sky-600 text-white rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                      }`}>
                      {msg.text}
                    </div>
                    {msg.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {msg.sources.map((src, i) => (
                          <span key={i} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">
                            {src.sourceModel}: {src.title?.slice(0, 25)}{src.title?.length > 25 ? '…' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Bot size={13} />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 rounded-tl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-slate-500"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-700 bg-slate-800/50">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask something..."
                  rows={1}
                  className="flex-1 resize-none bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors max-h-24"
                  style={{ minHeight: '38px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 text-center">
                Answers based on published CMS content
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/30 flex items-center justify-center transition-colors"
        aria-label="Toggle AI chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
