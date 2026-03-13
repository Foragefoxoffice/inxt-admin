import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { mediaAPI } from '../../api/endpoints';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { Search, Upload, Trash2, Image, Copy, Check } from 'lucide-react';

const MediaLibrary = () => {
  const toast = useToast();
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    mediaAPI.getAll(params)
      .then((res) => { setItems(res.data.data); setPagination(res.data.pagination); })
      .catch(() => toast.error('Failed to load media'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await mediaAPI.upload(formData);
      }
      toast.success(`${files.length} file(s) uploaded`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mediaAPI.delete(deleteId);
      toast.success('File deleted');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const isImage = (mimetype) => mimetype?.startsWith('image/');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Media Library</h2>
          <p className="text-slate-500 text-sm">{pagination?.total ?? 0} files</p>
        </div>
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div className="glass-card p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Image} title="No media files" description="Upload images and files to get started." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((file) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 hover:border-primary-400 transition-all"
              >
                {isImage(file.mimetype) ? (
                  <img src={file.url} alt={file.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-xs text-center truncate w-full">{file.originalName}</p>
                  <div className="flex gap-2">
                    <button onClick={() => copyUrl(file.url)}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Copy URL">
                      {copied === file.url ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <button onClick={() => setDeleteId(file._id)}
                      className="p-1.5 bg-red-500/70 hover:bg-red-500 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && pagination && <div className="mt-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete file?" message="This file will be permanently deleted." />
    </motion.div>
  );
};

export default MediaLibrary;
