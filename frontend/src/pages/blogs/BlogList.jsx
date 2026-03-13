import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogsAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';

const BlogList = () => {
  const { activeLanguageId } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;

    blogsAPI.getAll(params)
      .then((res) => {
        setBlogs(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => toast.error('Failed to load blogs'))
      .finally(() => setLoading(false));
  }, [activeLanguageId, search, status, page]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
  useEffect(() => { setPage(1); }, [activeLanguageId, search, status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogsAPI.delete(deleteId);
      toast.success('Blog deleted successfully');
      setDeleteId(null);
      fetchBlogs();
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Blog Posts</h2>
          <p className="text-slate-500 text-sm">{pagination?.total ?? 0} total posts</p>
        </div>
        <Link to="/blogs/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Blog
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
            placeholder="Search blogs..."
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
        ) : blogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No blogs found"
            description="Create your first blog post."
            action={<Link to="/blogs/new" className="btn-primary text-sm">New Blog</Link>}
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
                {blogs.map((blog, idx) => (
                  <tr key={blog._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium w-12">{(page - 1) * 10 + idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800 max-w-xs truncate">{blog.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">/{blog.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{blog.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {blog.languageId?.code} — {blog.languageId?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={blog.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/blogs/${blog._id}/edit`)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(blog._id)}
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
        title="Delete Blog?"
        message="This action cannot be undone."
      />
    </motion.div>
  );
};

export default BlogList;
