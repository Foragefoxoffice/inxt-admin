import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import BlockEditor from '../../components/BlockEditor';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FileUpload from '../../components/ui/FileUpload';
import { Form, Input, Select, DatePicker, Button, Card, Collapse, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, SearchOutlined, GlobalOutlined, PictureOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const defaultForm = {
  title: '', slug: '', excerpt: '', content: '', featuredImage: '',
  eventDate: null, eventLocation: '', category: 'news',
  author: '', tags: '', status: 'draft', languageId: '', blocks: [],
  seoMetaTitle: '', seoMetaDescription: '', seoKeywords: '',
  ogTitle: '', ogDescription: '', ogImage: '', ogType: 'article',
};

const NewsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { languages, activeLanguageId } = useLanguage();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    if (!isEdit && activeLanguageId) set('languageId', activeLanguageId);
  }, [activeLanguageId, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    newsAPI.getOne(id)
      .then((res) => {
        const n = res.data?.data || res.data;
        if (!n) throw new Error('No data');
        setForm({
          title: n.title || '', slug: n.slug || '', excerpt: n.excerpt || '',
          content: n.content || '', featuredImage: n.featuredImage || '',
          eventDate: n.eventDate ? dayjs(n.eventDate) : null,
          eventLocation: n.eventLocation || '', category: n.category || 'news',
          author: n.author || '', tags: Array.isArray(n.tags) ? n.tags.join(', ') : '',
          status: n.status || 'draft',
          languageId: n.languageId?._id || n.languageId || '',
          blocks: n.blocks || [],
          seoMetaTitle: n.seoMetaTitle || '', seoMetaDescription: n.seoMetaDescription || '',
          seoKeywords: Array.isArray(n.seoKeywords) ? n.seoKeywords.join(', ') : '',
          ogTitle: n.ogTitle || '', ogDescription: n.ogDescription || '',
          ogImage: n.ogImage || '', ogType: n.ogType || 'article',
        });
      })
      .catch(() => toast.error('Failed to load item'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    const finalLanguageId = form.languageId || (!isEdit ? activeLanguageId : null);
    if (!finalLanguageId) { toast.error('Please select a language from the sidebar'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        languageId: finalLanguageId,
        eventDate: form.eventDate ? dayjs(form.eventDate).format('YYYY-MM-DD') : '',
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        seoKeywords: form.seoKeywords ? form.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        blocks: (form.blocks || []).map(({ id, _id, ...rest }) => rest),
      };
      if (isEdit) { await newsAPI.update(id, payload); toast.success('Updated successfully'); }
      else { await newsAPI.create(payload); toast.success('Created successfully'); }
      navigate('/news');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  const activeLangName = (languages || []).find(l => l?._id === (form?.languageId || activeLanguageId))?.name;
  const imgSrc = form.featuredImage?.startsWith('/') ? `${window.location.origin}${form.featuredImage}` : form.featuredImage;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/news')} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 leading-none">{isEdit ? 'Edit News/Event' : 'New News/Event'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">{isEdit ? 'Update existing item' : 'Create a new news or event'}</span>
            {activeLangName && <Tag color="blue">{activeLangName}</Tag>}
            {!activeLangName && !isEdit && <Tag color="red">Select a language from sidebar</Tag>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/news')}>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700">Details</span>}>
            <div className="space-y-4">
              <Form.Item label={<span className="font-medium text-slate-700">Title <span className="text-red-500">*</span></span>} className="!mb-0">
                <Input size="large" value={form.title} onChange={(e) => {
                  const t = e.target.value;
                  setForm((p) => ({ ...p, title: t, slug: p.slug || t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }));
                }} placeholder="News or event title" className="!rounded-xl" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Slug</span>} className="!mb-0">
                  <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="auto-generated"
                    className="!rounded-xl !text-sm" prefix={<span className="text-slate-300 text-xs">/</span>} />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Type</span>} className="!mb-0">
                  <Select value={form.category} onChange={(v) => set('category', v)} className="!w-full">
                    <Option value="news">News</Option>
                    <Option value="event">Event</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Author</span>} className="!mb-0">
                  <Input value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Author name" className="!rounded-xl !text-sm" />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Tags</span>} className="!mb-0">
                  <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="tech, event, launch" className="!rounded-xl !text-sm" />
                </Form.Item>
              </div>

              {form.category === 'event' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <Form.Item label={<span className="text-sm font-medium text-slate-600">Event Date</span>} className="!mb-0">
                    <DatePicker value={form.eventDate} onChange={(date) => set('eventDate', date)} className="w-full !rounded-xl" format="DD/MM/YYYY" />
                  </Form.Item>
                  <Form.Item label={<span className="text-sm font-medium text-slate-600">Location</span>} className="!mb-0">
                    <Input value={form.eventLocation} onChange={(e) => set('eventLocation', e.target.value)}
                      placeholder="City, Country" className="!rounded-xl !text-sm" prefix={<EnvironmentOutlined className="text-slate-400" />} />
                  </Form.Item>
                </div>
              )}

              <Form.Item label={<span className="text-sm font-medium text-slate-600">Excerpt</span>} className="!mb-0">
                <TextArea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)}
                  rows={3} placeholder="Short description or summary..." className="!rounded-xl" />
              </Form.Item>
            </div>
          </Card>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Content <span className="text-slate-400 font-normal">(Drag blocks to reorder)</span></p>
            <BlockEditor blocks={form.blocks} onChange={(blocks) => set('blocks', blocks)} />
          </div>

          <Collapse className="!rounded-2xl !border-slate-100 !bg-white" items={[{
            key: 'seo',
            label: <div className="flex items-center gap-2"><SearchOutlined className="text-sky-500" /><span className="font-bold text-slate-700">SEO & Social</span><Tag color="blue" className="!text-[10px] !rounded !ml-1">Optional</Tag></div>,
            children: (
              <div className="space-y-4">
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Meta Title</span>} className="!mb-0">
                  <div className="relative">
                    <Input value={form.seoMetaTitle} onChange={(e) => set('seoMetaTitle', e.target.value)} placeholder="Search result title" maxLength={70} className="!rounded-xl !pr-16" />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none ${form.seoMetaTitle.length > 60 ? 'text-red-400' : 'text-slate-400'}`}>{form.seoMetaTitle.length}/70</span>
                  </div>
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Meta Description</span>} className="!mb-0">
                  <div className="relative">
                    <TextArea value={form.seoMetaDescription} onChange={(e) => set('seoMetaDescription', e.target.value)} rows={2} maxLength={200} className="!rounded-xl" />
                    <span className={`absolute right-3 bottom-3 text-xs font-bold pointer-events-none ${form.seoMetaDescription.length > 160 ? 'text-red-400' : 'text-slate-400'}`}>{form.seoMetaDescription.length}/200</span>
                  </div>
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Keywords</span>} className="!mb-0">
                  <Input value={form.seoKeywords} onChange={(e) => set('seoKeywords', e.target.value)} placeholder="news, event, launch" className="!rounded-xl" />
                </Form.Item>
              </div>
            )
          }]} />
        </div>

        <div className="w-[300px] flex-shrink-0 space-y-4 sticky top-6">
          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700">Publish Settings</span>}>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</p>
                <Select value={form.status} onChange={(v) => set('status', v)} className="w-full">
                  <Option value="draft"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Draft</span></Option>
                  <Option value="published"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Published</span></Option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700 flex items-center gap-2"><PictureOutlined />Featured Image</span>}>
            <div className="space-y-3">
              {form.featuredImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-100 group">
                  <img src={imgSrc} alt="Featured" className="w-full h-36 object-cover" />
                  <button type="button" onClick={() => set('featuredImage', '')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center text-slate-400 gap-2">
                  <PictureOutlined className="text-2xl" />
                  <p className="text-xs text-center">No image selected</p>
                </div>
              )}
              <Input value={form.featuredImage} onChange={(e) => set('featuredImage', e.target.value)} placeholder="Paste image URL" size="small" className="!rounded-lg !text-xs" />
              <FileUpload onUpload={(url) => set('featuredImage', url)} label="Upload Image" className="w-full" />
            </div>
          </Card>

          <div className="flex gap-2">
            <Button block onClick={() => navigate('/news')} className="!rounded-xl">Cancel</Button>
            <Button block type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit} className="!rounded-xl">
              {isEdit ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsForm;
