import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { newsletterIssuesAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FileUpload from '../../components/ui/FileUpload';
import { Form, Input, Select, DatePicker, Button, Card, Tag, Upload as AntUpload } from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PaperClipOutlined,
  PictureOutlined, InboxOutlined, DeleteOutlined, EyeOutlined
} from '@ant-design/icons';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const FILE_ICONS = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'text/plain': '📃',
  'application/zip': '🗜',
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const defaultForm = {
  title: '',
  featuredImage: '',
  author: '',
  description: '',
  issueDate: dayjs(),
  status: 'draft',
  languageId: '',
};

const NewsletterIssueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { languages, activeLanguageId } = useLanguage();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  useEffect(() => {
    if (!isEdit && activeLanguageId) set('languageId', activeLanguageId);
  }, [activeLanguageId, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    newsletterIssuesAPI.getOne(id)
      .then(res => {
        const d = res.data?.data || res.data;
        if (!d) throw new Error('No data');
        setForm({
          title: d.title || '',
          featuredImage: d.featuredImage || '',
          author: d.author || '',
          description: d.description || '',
          issueDate: d.issueDate ? dayjs(d.issueDate) : dayjs(),
          status: d.status || 'draft',
          languageId: d.languageId?._id || d.languageId || ''
        });
        setExistingDocs(d.documents || []);
      })
      .catch(() => toast.error('Failed to load issue'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    const finalLanguageId = form.languageId || activeLanguageId;
    if (!finalLanguageId) { toast.error('Please select a language from the sidebar'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('featuredImage', form.featuredImage);
      fd.append('author', form.author);
      fd.append('description', form.description);
      fd.append('issueDate', form.issueDate ? dayjs(form.issueDate).format('YYYY-MM-DD') : '');
      fd.append('status', form.status);
      fd.append('languageId', finalLanguageId);
      fd.append('existingDocuments', JSON.stringify(existingDocs));
      newFiles.forEach(f => fd.append('documents', f));
      if (isEdit) { await newsletterIssuesAPI.update(id, fd); toast.success('Issue updated'); }
      else { await newsletterIssuesAPI.create(fd); toast.success('Issue created'); }
      navigate('/newsletter');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  const activeLangName = (languages || []).find(l => l?._id === (form?.languageId || activeLanguageId))?.name;
  const imgSrc = form.featuredImage?.startsWith('/') ? `${window.location.origin}${form.featuredImage}` : form.featuredImage;
  const totalDocs = existingDocs.length + newFiles.length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/newsletter')} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 leading-none">{isEdit ? 'Edit Newsletter Issue' : 'New Newsletter Issue'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">{isEdit ? 'Update existing issue' : 'Create a new newsletter issue'}</span>
            {activeLangName && <Tag color="blue">{activeLangName}</Tag>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/newsletter')}>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Update Issue' : 'Create Issue'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Issue Details */}
          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700">Issue Details</span>}>
            <div className="space-y-4">
              <Form.Item label={<span className="font-medium text-slate-700">Title <span className="text-red-500">*</span></span>} className="!mb-0">
                <Input size="large" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. March 2026 Edition — The Future of AI" className="!rounded-xl" />
              </Form.Item>
              <Form.Item label={<span className="text-sm font-medium text-slate-600">Description</span>} className="!mb-0">
                <TextArea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={4} placeholder="Briefly describe what this newsletter issue is about..." className="!rounded-xl" />
              </Form.Item>
            </div>
          </Card>

          {/* Documents */}
          <Card
            className="!rounded-2xl !border-slate-100"
            title={
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <PaperClipOutlined className="text-sky-500" />
                  Documents
                  {totalDocs > 0 && <Tag color="blue" className="!text-xs !rounded">{totalDocs}</Tag>}
                </span>
                <Button size="small" type="primary" onClick={() => fileInputRef.current?.click()} className="!rounded-lg">
                  + Add Files
                </Button>
              </div>
            }
          >
            <input ref={fileInputRef} type="file" multiple className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" onChange={handleFileSelect} />

            {existingDocs.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Files</p>
                {existingDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-lg flex-shrink-0">{FILE_ICONS[doc.mimeType] || '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                      {doc.size && <p className="text-xs text-slate-400">{formatSize(doc.size)}</p>}
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        <Button size="small" icon={<EyeOutlined />} className="!rounded-lg">View</Button>
                      </a>
                    )}
                    <Button size="small" danger icon={<DeleteOutlined />} className="!rounded-lg"
                      onClick={() => setExistingDocs(prev => prev.filter((_, i) => i !== idx))} />
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {newFiles.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mb-4">
                  <p className="text-[11px] font-bold text-sky-500 uppercase tracking-wider">Ready to Upload</p>
                  {newFiles.map((file, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-sky-50 border border-sky-100 rounded-xl">
                      <span className="text-lg flex-shrink-0">{FILE_ICONS[file.type] || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                      </div>
                      <Button size="small" danger icon={<DeleteOutlined />} className="!rounded-lg"
                        onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {existingDocs.length === 0 && newFiles.length === 0 && (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-sky-300 hover:text-sky-400 cursor-pointer transition-all">
                <InboxOutlined className="text-4xl" />
                <div className="text-center">
                  <p className="font-semibold text-sm">Click to add documents</p>
                  <p className="text-xs mt-0.5">PDF, Word, Excel, ZIP — max 20MB each</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] flex-shrink-0 space-y-4 sticky top-6">
          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700">Issue Settings</span>}>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</p>
                <Select value={form.status} onChange={v => set('status', v)} className="w-full">
                  <Option value="draft"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Draft</span></Option>
                  <Option value="sent"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Sent</span></Option>
                </Select>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Issue Date <span className="text-red-400">*</span></p>
                <DatePicker value={form.issueDate} onChange={date => set('issueDate', date)} className="w-full !rounded-xl" format="DD/MM/YYYY" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Author</p>
                <Input value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" className="!rounded-xl !text-sm" />
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl !border-slate-100" size="small"
            title={<span className="font-bold text-slate-700 flex items-center gap-2"><PictureOutlined />Cover Image</span>}>
            <div className="space-y-3">
              {form.featuredImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={imgSrc} alt="Cover" className="w-full h-36 object-cover" />
                  <button type="button" onClick={() => set('featuredImage', '')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center text-slate-400 gap-2">
                  <PictureOutlined className="text-2xl" />
                  <p className="text-xs text-center">No cover image</p>
                </div>
              )}
              <Input value={form.featuredImage} onChange={e => set('featuredImage', e.target.value)}
                placeholder="Paste image URL" size="small" className="!rounded-lg !text-xs" />
              <FileUpload onUpload={(url) => set('featuredImage', url)} label="Upload Image" className="w-full" />
            </div>
          </Card>

          <div className="flex gap-2">
            <Button block onClick={() => navigate('/newsletter')} className="!rounded-xl">Cancel</Button>
            <Button block type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit} className="!rounded-xl">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterIssueForm;
