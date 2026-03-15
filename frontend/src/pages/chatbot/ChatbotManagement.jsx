import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, RefreshCw, Activity, Database, Globe, CheckCircle,
  XCircle, AlertCircle, Send, Loader2, User, ChevronDown, ChevronUp,
  FileText, Calendar, Briefcase, Zap, Mail, Phone, ExternalLink, Save
} from 'lucide-react';
import { chatAPI, languagesAPI } from '../../api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MODEL_ICONS = { Blog: FileText, News: Calendar, Career: Briefcase };
const MODEL_COLORS = {
  Blog: 'bg-sky-50 text-sky-700 border-sky-200',
  News: 'bg-violet-50 text-violet-700 border-violet-200',
  Career: 'bg-amber-50 text-amber-700 border-amber-200'
};
const MODEL_LABELS = { Blog: 'Blogs', News: 'News', Career: 'Careers' };

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-slate-700' }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
    </div>
  </div>
);

const AIStatusCard = ({ health, provider }) => {
  if (!health) return <StatCard icon={Activity} label={`${provider || 'AI'} Status`} value="—" />;
  const { available, models = [], missing = [], error } = health;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{provider} Status</p>
          <div className="flex items-center gap-2">
            {available ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${available ? 'text-emerald-700' : 'text-red-700'}`}>
              {available ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          <Activity className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      {error && <p className="text-[10px] text-red-500 mb-2 truncate" title={error}>{error}</p>}
      <div className="flex flex-wrap gap-1">
        {models.length > 0 ? models.slice(0, 3).map((m) => (
          <span key={m} className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
            <CheckCircle className="w-2.5 h-2.5" /> {m}
          </span>
        )) : !available && <span className="text-[10px] text-slate-400 italic">No models found</span>}
        {missing.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
            <AlertCircle className="w-2.5 h-2.5" /> {m}
          </span>
        ))}
      </div>
    </div>
  );
};

const WelcomeMsg = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! I\'m your AI assistant. Ask me anything based on the indexed knowledge base.',
  timestamp: new Date()
};

const ContactCard = ({ contact }) => {
  const hasAny = contact?.contactEmail || contact?.contactPhone || contact?.contactWebsite;
  if (!hasAny) return null;
  return (
    <div className="mt-2 bg-primary-50 border border-primary-100 rounded-xl p-3 text-xs text-slate-700 space-y-1.5">
      <p className="font-semibold text-primary-700">{contact.contactLabel || 'Contact Us'}</p>
      {contact.contactEmail && (
        <a href={`mailto:${contact.contactEmail}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
          <Mail size={12} /> {contact.contactEmail}
        </a>
      )}
      {contact.contactPhone && (
        <a href={`tel:${contact.contactPhone}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
          <Phone size={12} /> {contact.contactPhone}
        </a>
      )}
      {contact.contactWebsite && (
        <a href={contact.contactWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:underline">
          <ExternalLink size={12} /> {contact.contactWebsite}
        </a>
      )}
    </div>
  );
};

const TestChatPanel = ({ defaultLanguage }) => {
  const [messages, setMessages] = useState([WelcomeMsg]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(defaultLanguage || 'en');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      const langs = data.data || [];
      setAvailableLanguages(Array.isArray(langs) ? langs : []);
    }).catch(() => {});
  }, []);

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
      const { data } = await chatAPI.send({ message: text, language, topK: 5 });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.data?.response || 'Sorry, no response.',
        sources: data.data?.sources || [],
        noResults: data.data?.noResults || false,
        contact: data.data?.contact || null,
        timestamp: new Date()
      }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reach the AI service.';
      const detail = err.response?.data?.detail;
      setError(detail ? `${msg} (${detail})` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-800">Test Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-primary-400"
          >
            {availableLanguages.map(l => (
              <option key={l.code} value={l.code.toLowerCase()}>{l.code.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={() => { setMessages([WelcomeMsg]); setError(null); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Clear chat"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
              ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
            </div>
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'
                }`}>
                {msg.text}
              </div>
              {msg.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {msg.sources.map((src, i) => (
                    <span key={i} className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {src.type}: {src.title?.slice(0, 25)}{src.title?.length > 25 ? '…' : ''}
                    </span>
                  ))}
                </div>
              )}
              {msg.noResults && msg.contact && <ContactCard contact={msg.contact} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Bot size={13} />
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask the AI assistant..."
          rows={1}
          className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary-400 transition-colors"
          style={{ minHeight: '38px', maxHeight: '80px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
        </button>
      </div>
    </div>
  );
};

const ChatbotManagement = () => {
  const toast = useToast();
  const { activeLanguage } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [reindexing, setReindexing] = useState({}); // { all: bool, Blog: bool, News: bool, Career: bool }
  const [showTest, setShowTest] = useState(true);

  const [contactSettings, setContactSettings] = useState({ contactEmail: '', contactPhone: '', contactWebsite: '', contactLabel: 'Contact Us' });
  const [savingContact, setSavingContact] = useState(false);

  const fetchStats = () => {
    setLoadingStats(true);
    chatAPI.stats()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load chatbot stats'))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchStats();
    chatAPI.getSettings().then(res => {
      const s = res.data.data || {};
      setContactSettings({
        contactEmail: s.contactEmail || '',
        contactPhone: s.contactPhone || '',
        contactWebsite: s.contactWebsite || '',
        contactLabel: s.contactLabel || 'Contact Us',
      });
    }).catch(() => {});
  }, []);

  const handleReindex = async (model = null) => {
    const key = model || 'all';
    setReindexing(prev => ({ ...prev, [key]: true }));
    try {
      if (model) {
        await chatAPI.reindexModel(model);
      } else {
        await chatAPI.reindex();
      }
      toast.success(`Reindex ${model ? `for ${model}` : 'for all content'} started. This may take a few minutes.`);
      // Refresh stats after a short delay
      setTimeout(fetchStats, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reindex failed');
    } finally {
      setReindexing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleContactSave = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      await chatAPI.updateSettings(contactSettings);
      toast.success('Contact settings saved');
    } catch {
      toast.error('Failed to save contact settings');
    } finally {
      setSavingContact(false);
    }
  };

  // Build per-language rows from stats
  const languageRows = stats?.knowledgeBase?.byLanguage || [];
  const byLangModel = stats?.knowledgeBase?.byLanguageAndModel || [];

  const getCount = (lang, model) => {
    const entry = byLangModel.find(e => e._id.language === lang && e._id.sourceModel === model);
    return entry?.count || 0;
  };

  const getLastUpdated = (lang) => {
    const entry = languageRows.find(e => e._id === lang);
    if (!entry?.lastUpdated) return '—';
    return new Date(entry.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Chatbot</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage knowledge base and test the AI-powered chatbot
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => handleReindex()}
            disabled={reindexing.all}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {reindexing.all ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Reindex All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-24 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AIStatusCard health={stats?.ollama} provider={stats?.provider} />
          <StatCard
            icon={Database}
            label="Total Indexed"
            value={stats?.knowledgeBase?.total ?? '—'}
            sub="documents in knowledge base"
            color="text-slate-800"
          />
          <StatCard
            icon={Globe}
            label="Languages"
            value={languageRows.length || '—'}
            sub="with indexed content"
            color="text-slate-800"
          />
          <StatCard
            icon={Bot}
            label="Chat Model"
            value={stats?.ollama?.models?.find(m => (!m.includes('embed') && !m.includes('nomic')) )?.split(':').slice(0, 2).join(':') || '—'}
            sub={`via ${stats?.provider || 'AI'} provider`}
            color="text-primary-600"
          />
        </div>
      )}

      {/* Knowledge Base per Language */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Knowledge Base by Language</h3>
          </div>
          <p className="text-xs text-slate-400">Content auto-indexed when published</p>
        </div>

        {loadingStats ? (
          <div className="p-5"><LoadingSpinner /></div>
        ) : languageRows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No content indexed yet</p>
            <p className="text-xs text-slate-400 mt-1">Publish some blogs, news, or careers to start building the knowledge base.</p>
            <button
              onClick={() => handleReindex()}
              disabled={reindexing.all}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 mx-auto"
            >
              {reindexing.all ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Run Initial Index
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Language</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Blogs</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">News</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Careers</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {languageRows.map((row) => {
                  const lang = row._id;
                  return (
                    <tr key={lang} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold flex items-center justify-center">
                            {lang.toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-700">{lang.toUpperCase()}</span>
                        </span>
                      </td>
                      {['Blog', 'News', 'Career'].map(model => (
                        <td key={model} className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold border ${MODEL_COLORS[model]}`}>
                            {getCount(lang, model)}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-800">{row.total}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{getLastUpdated(lang)}</td>
                      <td className="px-5 py-3 text-right">
                        {/* No per-language reindex in current API — reindex all */}
                        <span className="text-xs text-slate-400 italic">Auto-synced</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reindex by Content Type */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-800">Reindex by Content Type</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Manually trigger re-embedding for a specific content type. Use this after bulk content imports or if the AI seems outdated.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Blog', 'News', 'Career'].map(model => {
            const Icon = MODEL_ICONS[model];
            const isRunning = reindexing[model];
            return (
              <button
                key={model}
                onClick={() => handleReindex(model)}
                disabled={isRunning || reindexing.all}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${MODEL_COLORS[model]} hover:shadow-sm`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                  {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{MODEL_LABELS[model]}</p>
                  <p className="text-xs opacity-70">{isRunning ? 'Indexing…' : 'Re-embed all published'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Chat */}
      <div>
        <button
          onClick={() => setShowTest(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3 hover:text-primary-600 transition-colors"
        >
          <Bot size={16} />
          Test Chatbot
          {showTest ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence initial={false}>
          {showTest && (
            <motion.div
              key="test-chat"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <TestChatPanel defaultLanguage={activeLanguage?.code || 'en'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact Info Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Mail size={15} className="text-primary-500" /> Contact Info (shown when AI can't find an answer)
        </h3>
        <form onSubmit={handleContactSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Button Label</label>
              <input
                type="text"
                value={contactSettings.contactLabel}
                onChange={e => setContactSettings(p => ({ ...p, contactLabel: e.target.value }))}
                placeholder="Contact Us"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={contactSettings.contactEmail}
                onChange={e => setContactSettings(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="support@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={contactSettings.contactPhone}
                onChange={e => setContactSettings(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="+1 234 567 890"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Website</label>
              <input
                type="url"
                value={contactSettings.contactWebsite}
                onChange={e => setContactSettings(p => ({ ...p, contactWebsite: e.target.value }))}
                placeholder="https://example.com/contact"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingContact}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {savingContact ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Contact Info
            </button>
          </div>
        </form>
      </div>

      {/* How it works */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-500" /> Provider Notes
        </h3>
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800 font-medium">
            ⚠️ Switching between Ollama and OpenAI? You MUST click "Reindex All" below. 
            OpenAI vectors (1536d) are incompatible with Ollama vectors (768d). 
            If vectors don't match, similarity search will fail.
          </p>
        </div>
        <ol className="space-y-2 text-xs text-slate-600">
          <li className="flex gap-2"><span className="font-bold text-primary-600">1.</span> Active Provider: <strong>{stats?.provider || 'Loading...'}</strong> (Set via <code className="bg-slate-200 px-1 rounded">AI_PROVIDER</code> in .env).</li>
          <li className="flex gap-2"><span className="font-bold text-primary-600">2.</span> When you publish content, it's embedded using the active provider ({stats?.ollama?.models?.find(m => m.includes('embed')) || 'embedding model'}) and stored in the knowledge base.</li>
          <li className="flex gap-2"><span className="font-bold text-primary-600">3.</span> User questions are compared (cosine similarity) against the knowledge base to find relevant context.</li>
          <li className="flex gap-2"><span className="font-bold text-primary-600">4.</span> Context is sent to the chat model ({stats?.ollama?.models?.find(m => !m.includes('embed')) || 'chat model'}) to generate a grounded, factual answer.</li>
        </ol>
      </div>
    </div>
  );
};

export default ChatbotManagement;
