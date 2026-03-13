import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { chatContentAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Plus, Search, Pencil, Trash2, Bot } from 'lucide-react';

const ChatContentList = () => {
  const { activeLanguageId } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;

    chatContentAPI.getAll(params)
      .then((res) => {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load chat content'))
      .finally(() => setLoading(false));
  }, [activeLanguageId, search, status, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [activeLanguageId, search, status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await chatContentAPI.delete(deleteId);
      toast.success('Content deleted successfully');
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error('Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chat Content</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manual knowledge base entries for the AI chatbot
          </p>
        </div>
        <Link
          to="/chatbot/content/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Content
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No chat content yet"
            description={
              activeLanguageId
                ? 'Add manual knowledge base entries for the selected language.'
                : 'Select a language and add content the AI chatbot can reference.'
            }
            action={
              <Link
                to="/chatbot/content/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} /> Add First Content
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Language</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Updated</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-medium w-12">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot size={14} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.content?.slice(0, 80)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {item.category ? (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{item.category}</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <span className="w-5 h-5 rounded bg-primary-50 text-primary-700 text-[10px] font-bold flex items-center justify-center">
                            {(item.languageId?.code || item.language || '').toUpperCase().slice(0, 2)}
                          </span>
                          {item.languageId?.name || item.language}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/chatbot/content/${item._id}/edit`)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100">
                <Pagination
                  current={pagination.page}
                  total={pagination.pages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Content"
        message="This will also remove it from the chatbot knowledge base. This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ChatContentList;
