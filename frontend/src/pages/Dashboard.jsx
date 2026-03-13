import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, Statistic, Button, Tag, Skeleton, Empty } from 'antd';
import { ArrowRightOutlined, PlusOutlined, RiseOutlined } from '@ant-design/icons';
import { dashboardAPI } from '../api/endpoints';
import { useLanguage } from '../contexts/LanguageContext';
import StatusBadge from '../components/ui/StatusBadge';
import {
  FileText, Calendar, Briefcase, Mail, Globe,
  FileDown, Video, ArrowRight
} from 'lucide-react';

const statCards = (stats) => [
  { label: 'Total Blogs', value: stats?.blogs?.total, sub: `${stats?.blogs?.published ?? 0} published`, icon: FileText, gradient: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-200' },
  { label: 'News & Events', value: stats?.news?.total, icon: Calendar, gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200' },
  { label: 'White Papers', value: stats?.whitePapers?.total, icon: FileDown, gradient: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-200' },
  { label: 'Webinars', value: stats?.webinars?.total, icon: Video, gradient: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-200' },
  { label: 'Open Jobs', value: stats?.careers?.open, sub: `${stats?.careers?.total ?? 0} total`, icon: Briefcase, gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
  { label: 'Subscribers', value: stats?.newsletter?.active, sub: `${stats?.newsletter?.total ?? 0} total`, icon: Mail, gradient: 'from-pink-500 to-pink-600', shadow: 'shadow-pink-200' },
  { label: 'Languages', value: stats?.languages?.total, icon: Globe, gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-200' },
];

const quickActions = [
  { label: 'New Blog', to: '/blogs/new', color: '#0ea5e9' },
  { label: 'New White Paper', to: '/white-papers/new', color: '#6366f1' },
  { label: 'New Webinar', to: '/webinars/new', color: '#f97316' },
  { label: 'New Event', to: '/news/new', color: '#8b5cf6' },
  { label: 'New Job', to: '/careers/new', color: '#f59e0b' },
];

const Dashboard = () => {
  const { activeLanguageId } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardAPI.getStats(activeLanguageId ? { languageId: activeLanguageId } : {})
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeLanguageId]);

  const { stats, recent } = data || {};
  const cards = statCards(stats);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <Card key={i} className="!rounded-2xl !border-slate-100">
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            ))
          : cards.map(({ label, value, sub, icon: Icon, gradient, shadow }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`!rounded-2xl !border-0 shadow-md ${shadow} hover:shadow-lg transition-shadow`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
                      <p className="text-2xl font-bold text-slate-800 leading-none">{value ?? <span className="text-slate-300">—</span>}</p>
                      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card
          className="!rounded-2xl !border-slate-100"
          title={
            <span className="flex items-center gap-2 text-slate-800 font-bold">
              <RiseOutlined className="text-sky-500" />
              Quick Actions
            </span>
          }
        >
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to}>
                <Button
                  icon={<PlusOutlined />}
                  style={{ background: a.color, borderColor: a.color, borderRadius: 10 }}
                  type="primary"
                  size="middle"
                >
                  {a.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card
            className="!rounded-2xl !border-slate-100 h-full"
            title={<span className="font-bold text-slate-800">Recent Blogs</span>}
            extra={
              <Link to="/blogs" className="text-xs text-sky-500 hover:text-sky-700 flex items-center gap-1">
                View all <ArrowRightOutlined />
              </Link>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : !recent?.blogs?.length ? (
              <Empty description="No blogs yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-2">
                {recent.blogs.map((b) => (
                  <div key={b._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-sky-50 transition-colors">
                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{b.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={b.status} />
                        {b.languageId?.code && (
                          <Tag className="!text-[10px] !rounded !m-0 !py-0">{b.languageId.code.toUpperCase()}</Tag>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent News */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card
            className="!rounded-2xl !border-slate-100 h-full"
            title={<span className="font-bold text-slate-800">Recent News & Events</span>}
            extra={
              <Link to="/news" className="text-xs text-sky-500 hover:text-sky-700 flex items-center gap-1">
                View all <ArrowRightOutlined />
              </Link>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : !recent?.news?.length ? (
              <Empty description="No news yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-2">
                {recent.news.map((n) => (
                  <div key={n._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-violet-50 transition-colors">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{n.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={n.category} />
                        {n.languageId?.code && (
                          <Tag className="!text-[10px] !rounded !m-0 !py-0">{n.languageId.code.toUpperCase()}</Tag>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
