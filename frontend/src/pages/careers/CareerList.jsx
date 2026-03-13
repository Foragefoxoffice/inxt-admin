import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { careersAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Plus, Search, Pencil, Trash2, Briefcase } from 'lucide-react';

const CareerList = () => {
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

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;
    careersAPI.getAll(params)
      .then((res) => { setItems(res.data.data); setPagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, [activeLanguageId, search, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeLanguageId, search, status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await careersAPI.delete(deleteId);
      toast.success('Job deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Job Listings</h2>
          <p className="text-slate-500 text-sm">{pagination?.total ?? 0} jobs</p>
        </div>
        <Link to="/careers/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Job
        </Link>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
          : items.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs found"
              action={<Link to="/careers/new" className="btn-primary text-sm">New Job</Link>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['#', 'Title', 'Department', 'Type', 'Language', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((job, idx) => (
                    <tr key={job._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium w-12">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">{job.title}</p>
                        {job.location && <p className="text-xs text-slate-400">{job.location}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{job.department}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{job.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{job.languageId?.code}</span>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/careers/${job._id}/edit`)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(job._id)}
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
          )}
        {!loading && pagination && <div className="px-6 pb-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
      </div>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete job?" />
    </motion.div>
  );
};

export default CareerList;
