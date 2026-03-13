import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { whitePapersAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';

const WhitePaperList = () => {
  const { activeLanguageId } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [whitePapers, setWhitePapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWhitePapers = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;

    whitePapersAPI.getAll(params)
      .then((res) => {
        setWhitePapers(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load white papers'))
      .finally(() => setLoading(false));
  }, [activeLanguageId, search, status, page]);

  useEffect(() => { fetchWhitePapers(); }, [fetchWhitePapers]);
  useEffect(() => { setPage(1); }, [activeLanguageId, search, status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await whitePapersAPI.delete(deleteId);
      toast.success('White Paper deleted successfully');
      setDeleteId(null);
      fetchWhitePapers();
    } catch {
      toast.error('Failed to delete white paper');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">White Papers</h2>
          <p className="text-slate-500 text-sm">{pagination?.total ?? 0} total documents</p>
        </div>
        <Link to="/white-papers/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New White Paper
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search white papers..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
        ) : whitePapers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No white papers found"
            description="Upload your first white paper."
            action={<Link to="/white-papers/new" className="btn-primary text-sm">New White Paper</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['#', 'Title', 'Category', 'Language', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {whitePapers.map((whitePaper, idx) => (
                  <tr key={whitePaper._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium w-12">{(page - 1) * 10 + idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800 max-w-xs truncate">{whitePaper.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">/{whitePaper.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{whitePaper.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {whitePaper.languageId?.code} — {whitePaper.languageId?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={whitePaper.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(whitePaper.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/white-papers/${whitePaper._id}/edit`)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(whitePaper._id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && pagination && (
          <div className="px-6 pb-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete White Paper?"
        message="This action cannot be undone."
      />
    </motion.div>
  );
};

export default WhitePaperList;
