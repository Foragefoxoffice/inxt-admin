import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { careersAPI } from '../../api/endpoints';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import RichTextEditor from '../../components/RichTextEditor';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Form, Input, Select, Button, Card, Tag } from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined,
  EnvironmentOutlined, DollarOutlined, TeamOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const defaultForm = {
  title: '', slug: '', department: '', location: '', type: 'full-time',
  experience: '', salary: '', description: '', requirements: '', benefits: '',
  status: 'open', languageId: ''
};

const CareerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { languages } = useLanguage();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    if (!isEdit) return;
    careersAPI.getOne(id)
      .then((res) => {
        const j = res.data.data;
        setForm({
          title: j.title || '', slug: j.slug || '', department: j.department || '',
          location: j.location || '', type: j.type || 'full-time',
          experience: j.experience || '', salary: j.salary || '',
          description: j.description || '',
          requirements: (j.requirements || []).join('\n'),
          benefits: (j.benefits || []).join('\n'),
          status: j.status || 'open',
          languageId: j.languageId?._id || j.languageId || ''
        });
      })
      .catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!form.languageId) { toast.error('Please select a language'); return; }
    if (!form.title.trim()) { toast.error('Job title is required'); return; }
    if (!form.department.trim()) { toast.error('Department is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements ? form.requirements.split('\n').map((r) => r.trim()).filter(Boolean) : [],
        benefits: form.benefits ? form.benefits.split('\n').map((b) => b.trim()).filter(Boolean) : []
      };
      if (isEdit) { await careersAPI.update(id, payload); toast.success('Job updated'); }
      else { await careersAPI.create(payload); toast.success('Job created'); }
      navigate('/careers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  const statusColor = { open: 'success', closed: 'error', draft: 'default' };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/careers')} />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800 leading-none">{isEdit ? 'Edit Job Listing' : 'New Job Listing'}</h2>
          <p className="text-sm text-slate-500 mt-1">{isEdit ? 'Update the job details' : 'Create a new career opportunity'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/careers')}>Cancel</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Update Job' : 'Post Job'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left: Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Job Details */}
          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700 flex items-center gap-2"><TeamOutlined className="text-sky-500" />Job Details</span>}>
            <div className="space-y-4">
              <Form.Item label={<span className="font-medium text-slate-700">Job Title <span className="text-red-500">*</span></span>} className="!mb-0">
                <Input size="large" value={form.title} onChange={(e) => {
                  const t = e.target.value;
                  setForm((p) => ({ ...p, title: t, slug: p.slug || t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') }));
                }} placeholder="e.g. Senior Frontend Developer" className="!rounded-xl" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Department <span className="text-red-500">*</span></span>} className="!mb-0">
                  <Input value={form.department} onChange={(e) => set('department', e.target.value)}
                    placeholder="Engineering, Marketing..." className="!rounded-xl !text-sm" prefix={<TeamOutlined className="text-slate-400" />} />
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Location</span>} className="!mb-0">
                  <Input value={form.location} onChange={(e) => set('location', e.target.value)}
                    placeholder="City, Country / Remote" className="!rounded-xl !text-sm" prefix={<EnvironmentOutlined className="text-slate-400" />} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Job Type</span>} className="!mb-0">
                  <Select value={form.type} onChange={(v) => set('type', v)} className="!w-full">
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="remote">Remote</Option>
                  </Select>
                </Form.Item>
                <Form.Item label={<span className="text-sm font-medium text-slate-600">Experience</span>} className="!mb-0">
                  <Input value={form.experience} onChange={(e) => set('experience', e.target.value)}
                    placeholder="e.g. 3+ years" className="!rounded-xl !text-sm" />
                </Form.Item>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700">Job Description <span className="text-red-500">*</span></span>}>
            <RichTextEditor value={form.description} onChange={(val) => set('description', val)} placeholder="Describe the role, responsibilities, and what you're looking for..." />
          </Card>

          {/* Requirements & Benefits */}
          <Card className="!rounded-2xl !border-slate-100" title={<span className="font-bold text-slate-700">Requirements & Benefits</span>}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Requirements <span className="font-normal text-slate-400 normal-case">(one per line)</span></p>
                <TextArea value={form.requirements} onChange={(e) => set('requirements', e.target.value)}
                  className="!rounded-xl" rows={8}
                  placeholder={`5+ years React\nStrong TypeScript\nTeam player`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Benefits <span className="font-normal text-slate-400 normal-case">(one per line)</span></p>
                <TextArea value={form.benefits} onChange={(e) => set('benefits', e.target.value)}
                  className="!rounded-xl" rows={8}
                  placeholder={`Health insurance\nRemote work\n401k matching`} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] flex-shrink-0 space-y-4 sticky top-6">
          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700">Job Settings</span>}>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</p>
                <Select value={form.status} onChange={(v) => set('status', v)} className="w-full">
                  <Option value="open"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Open</span></Option>
                  <Option value="draft"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Draft</span></Option>
                  <Option value="closed"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Closed</span></Option>
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Language <span className="text-red-400">*</span></p>
                <Select value={form.languageId} onChange={(v) => set('languageId', v)} className="w-full" placeholder="Select language">
                  {languages.map((l) => <Option key={l._id} value={l._id}>{l.name}</Option>)}
                </Select>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Salary Range</p>
                <Input value={form.salary} onChange={(e) => set('salary', e.target.value)}
                  placeholder="$80k – $120k" className="!rounded-xl !text-sm" prefix={<DollarOutlined className="text-slate-400" />} />
              </div>
            </div>
          </Card>

          {/* Job Type badges */}
          <Card className="!rounded-2xl !border-slate-100" size="small" title={<span className="font-bold text-slate-700">Quick Info</span>}>
            <div className="space-y-2 text-sm">
              {form.type && <div className="flex items-center justify-between"><span className="text-slate-500">Type</span><Tag color="blue">{form.type}</Tag></div>}
              {form.experience && <div className="flex items-center justify-between"><span className="text-slate-500">Experience</span><span className="font-medium text-slate-700">{form.experience}</span></div>}
              {form.location && <div className="flex items-center justify-between"><span className="text-slate-500">Location</span><span className="font-medium text-slate-700 text-right text-xs">{form.location}</span></div>}
              {form.salary && <div className="flex items-center justify-between"><span className="text-slate-500">Salary</span><span className="font-medium text-emerald-600">{form.salary}</span></div>}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button block onClick={() => navigate('/careers')} className="!rounded-xl">Cancel</Button>
            <Button block type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSubmit} className="!rounded-xl">
              {isEdit ? 'Update' : 'Post Job'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CareerForm;
