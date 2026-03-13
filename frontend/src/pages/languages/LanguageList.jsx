import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { languagesAPI } from '../../api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSpinner';
import { Plus, Globe, Pencil, Trash2, Search } from 'lucide-react';

const defaultForm = { name: '', code: '', isActive: true };

const LanguageList = () => {
  const toast = useToast();
  const { languages: ctxLanguages } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (search) params.search = search;
    languagesAPI.getAll(params)
      .then((res) => setItems(res.data.data))
      .catch(() => toast.error('Failed to load languages'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(defaultForm); setEditId(null); setModalOpen(true); };
  const openEdit = (c) => { setForm({ name: c.name, code: c.code, isActive: c.isActive }); setEditId(c._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await languagesAPI.update(editId, form); toast.success('Language updated'); }
      else { await languagesAPI.create(form); toast.success('Language created'); }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await languagesAPI.delete(deleteId);
      toast.success('Language deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Failed to delete language'); }
    finally { setDeleting(false); }
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Languages</h2>
          <p className="text-slate-500 text-sm">{items.length} languages</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Language
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
          : items.length === 0 ? <EmptyState icon={Globe} title="No languages found" action={<button onClick={openCreate} className="btn-primary text-sm">Add Language</button>} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Language', 'Code', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{c.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(c._id)}
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
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Language' : 'Add Language'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Language Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClass} placeholder="English" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Language Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              className={inputClass} placeholder="EN" maxLength={3} required />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
              {saving ? 'Saving...' : editId ? 'Update' : 'Add Language'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete language?" message="This will remove the language. All linked content will lose their language reference." />
    </motion.div>
  );
};

export default LanguageList;
