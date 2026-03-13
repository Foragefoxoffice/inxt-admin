import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { chatContentAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Form, Input, Select, Button, Card, Alert, Switch, Tag } from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, RobotOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const defaultForm = {
  title: '', content: '', category: '', status: 'active', languageId: ''
};

const ChatContentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { languages, activeLanguageId } = useLanguage();
  const isEdit = !!id;

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (!isEdit && activeLanguageId) set('languageId', activeLanguageId);
  }, [activeLanguageId, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    chatContentAPI.getOne(id)
      .then((res) => {
        const d = res.data.data;
        setForm({
          title: d.title || '', content: d.content || '', category: d.category || '',
          status: d.status || 'active',
          languageId: d.languageId?._id || d.languageId || ''
        });
      })
      .catch(() => { toast.error('Failed to load content'); navigate('/chatbot/content'); })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    if (!form.languageId) { toast.error('Please select a language'); return; }
    setSaving(true);
    try {
      if (isEdit) { await chatContentAPI.update(id, form); toast.success('Content updated and re-indexed'); }
      else { await chatContentAPI.create(form); toast.success('Content created and indexed'); }
      navigate('/chatbot/content');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save content');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Loading content..." />;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/chatbot/content')} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 leading-none flex items-center gap-2">
            <RobotOutlined className="text-sky-500" />
            {isEdit ? 'Edit Chat Content' : 'Add Chat Content'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">This content will be embedded and used by the AI chatbot</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/chatbot/content')}>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create & Index'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left: Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          <Alert
            message="How this works"
            description={
              <span className="text-xs">
                Content added here is automatically embedded using <strong>nomic-embed-text</strong> and stored in the knowledge base.
                The <strong>phi3</strong> model uses this context to answer user questions accurately.
              </span>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            className="!rounded-xl !border-sky-200 !bg-sky-50"
          />

          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700 flex items-center gap-2"><RobotOutlined className="text-sky-500" />Content Details</span>}>
            <div className="space-y-4">
              <Form.Item label={<span className="font-medium text-slate-700">Title <span className="text-red-500">*</span></span>} className="!mb-0">
                <Input size="large" value={form.title} onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. What is your refund policy?" className="!rounded-xl" />
                <p className="text-xs text-slate-400 mt-1">A short descriptive title for this knowledge entry</p>
              </Form.Item>

              <Form.Item label={<span className="text-sm font-medium text-slate-600">Category <span className="text-slate-400 font-normal">(optional)</span></span>} className="!mb-0">
                <Input value={form.category} onChange={(e) => set('category', e.target.value)}
                  placeholder="e.g. FAQ, Policy, Product Info, Support..." className="!rounded-xl !text-sm" />
              </Form.Item>

              <Form.Item label={<span className="font-medium text-slate-700">Content <span className="text-red-500">*</span></span>} className="!mb-0">
                <TextArea value={form.content} onChange={(e) => set('content', e.target.value)}
                  placeholder="Write the full content that the AI should use to answer related questions. The more detailed and clear, the better the AI responses will be."
                  rows={14} className="!rounded-xl leading-relaxed" />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400">Plain text works best. HTML tags are stripped automatically.</p>
                  <span className={`text-xs font-medium ${form.content.length > 4000 ? 'text-amber-500' : 'text-slate-400'}`}>{form.content.length} chars</span>
                </div>
              </Form.Item>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-[260px] flex-shrink-0 space-y-4 sticky top-6">
          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700">Settings</span>}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Language <span className="text-red-400">*</span></p>
                <Select value={form.languageId} onChange={(v) => set('languageId', v)} className="w-full"
                  placeholder="Select language" disabled={isEdit}>
                  {languages.map((lang) => (
                    <Option key={lang._id} value={lang._id}>{lang.name} ({lang.code?.toUpperCase()})</Option>
                  ))}
                </Select>
                {isEdit && <p className="text-xs text-slate-400 mt-1">Language cannot be changed after creation</p>}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Active Status</p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {form.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {form.status === 'active' ? 'Used by chatbot' : 'Not used by chatbot'}
                    </p>
                  </div>
                  <Switch
                    checked={form.status === 'active'}
                    onChange={(checked) => set('status', checked ? 'active' : 'inactive')}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Info card */}
          <Card className="!rounded-2xl !border-slate-100 !bg-gradient-to-br from-sky-50 to-indigo-50" size="small"
            bodyStyle={{ padding: 12 }}>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-700">Tips for good content</p>
              <ul className="space-y-1 list-none">
                {['Be specific and detailed', 'Use natural language', 'Include common questions', 'Keep it factual'].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <span className="text-sky-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button block onClick={() => navigate('/chatbot/content')} className="!rounded-xl">Cancel</Button>
            <Button block type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit} className="!rounded-xl">
              {isEdit ? 'Save' : 'Index'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatContentForm;
