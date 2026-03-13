import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { applicantsAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Search, Users, Eye, ExternalLink } from 'lucide-react';

const statuses = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];

const ApplicantList = () => {
  const { activeLanguageId } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (activeLanguageId) params.languageId = activeLanguageId;
    if (search) params.search = search;
    if (status) params.status = status;
    applicantsAPI.getAll(params)
      .then((res) => { setItems(res.data.data); setPagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [activeLanguageId, search, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeLanguageId, search, status]);

  const handleStatusChange = async (applicantId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await applicantsAPI.updateStatus(applicantId, { status: newStatus });
      toast.success('Status updated');
      fetchData();
      if (selected?._id === applicantId) setSelected((p) => ({ ...p, status: newStatus }));
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Job Applicants</h2>
          <p className="text-slate-500 text-sm">{pagination?.total ?? 0} applicants</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          <option value="">All Status</option>
          {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
          : items.length === 0 ? <EmptyState icon={Users} title="No applicants found" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Applicant', 'Job', 'Language', 'Status', 'Applied', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{a.jobId?.title || '-'}</p>
                        {a.jobId?.department && <p className="text-xs text-slate-400">{a.jobId.department}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a.languageId?.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a._id, e.target.value)}
                          disabled={updatingStatus}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(a)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {a.resume && (
                            <a href={a.resume} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors" title="View Resume">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
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

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Applicant Details" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selected.name}</h3>
                <p className="text-sm text-slate-500">{selected.email}</p>
                {selected.phone && <p className="text-sm text-slate-500">{selected.phone}</p>}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <p><span className="font-medium text-slate-600">Job:</span> {selected.jobId?.title}</p>
              <p><span className="font-medium text-slate-600">Language:</span> {selected.languageId?.name}</p>
              <p><span className="font-medium text-slate-600">Status:</span> <StatusBadge status={selected.status} /></p>
              <p><span className="font-medium text-slate-600">Applied:</span> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            {selected.coverLetter && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Cover Letter</p>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{selected.coverLetter}</p>
              </div>
            )}
            {selected.notes && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Notes</p>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{selected.notes}</p>
              </div>
            )}
            {selected.resume && (
              <a href={selected.resume} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                <ExternalLink className="w-4 h-4" /> View Resume
              </a>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ApplicantList;
