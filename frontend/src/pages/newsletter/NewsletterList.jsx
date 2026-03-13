import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsletterAPI, newsletterIssuesAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Search, Mail, Download, Trash2, Plus, FileText, Edit2, Calendar, Paperclip } from 'lucide-react';

const NewsletterList = () => {
  const { activeLanguageId, activeLanguage } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('issues'); // 'issues' | 'subscribers'

  // ── Subscribers state ──────────────────────────────────────
  const [subscribers, setSubscribers] = useState([]);
  const [subPagination, setSubPagination] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subPage, setSubPage] = useState(1);
  const [deleteSubId, setDeleteSubId] = useState(null);
  const [deletingSubId, setDeletingSubId] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Issues state ───────────────────────────────────────────
  const [issues, setIssues] = useState([]);
  const [issuePagination, setIssuePagination] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSearch, setIssueSearch] = useState('');
  const [issuePage, setIssuePage] = useState(1);
  const [deleteIssueId, setDeleteIssueId] = useState(null);
  const [deletingIssue, setDeletingIssue] = useState(false);

  // ── Fetch subscribers ──────────────────────────────────────
  const fetchSubscribers = useCallback(() => {
    setSubLoading(true);
    const params = { page: subPage, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;
    newsletterAPI.getAll(params)
      .then(res => { setSubscribers(res.data.data); setSubPagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setSubLoading(false));
  }, [activeLanguageId, search, status, subPage]);

  // ── Fetch issues ───────────────────────────────────────────
  const fetchIssues = useCallback(() => {
    setIssueLoading(true);
    const params = { page: issuePage, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (issueSearch) params.search = issueSearch;
    newsletterIssuesAPI.getAll(params)
      .then(res => { setIssues(res.data.data); setIssuePagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load issues'))
      .finally(() => setIssueLoading(false));
  }, [activeLanguageId, issueSearch, issuePage]);

  useEffect(() => { if (tab === 'subscribers') fetchSubscribers(); }, [fetchSubscribers, tab]);
  useEffect(() => { if (tab === 'issues') fetchIssues(); }, [fetchIssues, tab]);
  useEffect(() => { setSubPage(1); }, [activeLanguageId, search, status]);
  useEffect(() => { setIssuePage(1); }, [activeLanguageId, issueSearch]);

  // ── Handlers ───────────────────────────────────────────────
  const handleDeleteSubscriber = async () => {
    setDeletingSubId(true);
    try {
      await newsletterAPI.delete(deleteSubId);
      toast.success('Subscriber deleted');
      setDeleteSubId(null);
      fetchSubscribers();
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingSubId(false); }
  };

  const handleDeleteIssue = async () => {
    setDeletingIssue(true);
    try {
      await newsletterIssuesAPI.delete(deleteIssueId);
      toast.success('Issue deleted');
      setDeleteIssueId(null);
      fetchIssues();
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingIssue(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (activeLanguageId) params.languageId = activeLanguageId;
      if (status) params.status = status;
      const res = await newsletterAPI.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `newsletter_${activeLanguage?.code || 'all'}_${Date.now()}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
    try {
      await newsletterAPI.updateStatus(id, { status: newStatus });
      fetchSubscribers();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Newsletter</h2>
          <p className="text-slate-500 text-sm">Manage issues and subscribers</p>
        </div>
        {tab === 'issues' ? (
          <button onClick={() => navigate('/newsletter/issues/new')}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> New Issue
          </button>
        ) : (
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'issues', label: 'Issues', icon: FileText },
          { key: 'subscribers', label: 'Subscribers', icon: Mail }
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Issues Tab ── */}
      {tab === 'issues' && (
        <>
          <div className="glass-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={issueSearch} onChange={e => setIssueSearch(e.target.value)}
                placeholder="Search issues..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            {issueLoading
              ? <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
              : issues.length === 0
                ? <EmptyState icon={FileText} title="No issues yet" description="Create your first newsletter issue"
                    action={<button onClick={() => navigate('/newsletter/issues/new')} className="btn-primary text-sm px-4 py-2 flex items-center gap-2"><Plus className="w-4 h-4" />Create Issue</button>} />
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {['#', 'Title', 'Date', 'Docs', 'Status', 'Language', 'Actions'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {issues.map((issue, idx) => (
                          <tr key={issue._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-400 font-medium w-12">{idx + 1}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
                              {issue.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{issue.description}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(issue.issueDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                {issue.documents?.length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                issue.status === 'sent'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {issue.status === 'sent' ? '✓ Sent' : '◌ Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {issue.languageId?.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => navigate(`/newsletter/issues/${issue._id}/edit`)}
                                  className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-500 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteIssueId(issue._id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
            {!issueLoading && issuePagination && (
              <div className="px-6 pb-4"><Pagination pagination={issuePagination} onPageChange={setIssuePage} /></div>
            )}
          </div>
        </>
      )}

      {/* ── Subscribers Tab ── */}
      {tab === 'subscribers' && (
        <>
          <div className="glass-card p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by email or name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <div className="glass-card overflow-hidden">
            {subLoading ? <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
              : subscribers.length === 0 ? <EmptyState icon={Mail} title="No subscribers found" />
              : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Email', 'Name', 'Language', 'Status', 'Subscribed', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {subscribers.map(s => (
                        <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-800">{s.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{s.name || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.languageId?.code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleStatusToggle(s._id, s.status)}>
                              <StatusBadge status={s.status} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(s.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => setDeleteSubId(s._id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            {!subLoading && subPagination && (
              <div className="px-6 pb-4"><Pagination pagination={subPagination} onPageChange={setSubPage} /></div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog isOpen={!!deleteSubId} onClose={() => setDeleteSubId(null)} onConfirm={handleDeleteSubscriber} loading={deletingSubId} title="Remove subscriber?" />
      <ConfirmDialog isOpen={!!deleteIssueId} onClose={() => setDeleteIssueId(null)} onConfirm={handleDeleteIssue} loading={deletingIssue} title="Delete this newsletter issue?" />
    </motion.div>
  );
};

export default NewsletterList;
