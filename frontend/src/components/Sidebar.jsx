import { NavLink } from 'react-router-dom';
import { Tooltip } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Calendar, Mail,
  Briefcase, Settings, Globe, LogOut, Bot, BookOpen,
  FileDown, Video
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Blogs', icon: FileText, path: '/blogs' },
  { name: 'White Papers', icon: FileDown, path: '/white-papers' },
  { name: 'Webinars', icon: Video, path: '/webinars' },
  { name: 'News & Events', icon: Calendar, path: '/news' },
  { name: 'Newsletter', icon: Mail, path: '/newsletter' },
  { name: 'Careers', icon: Briefcase, path: '/careers' },
  { name: 'AI Chatbot', icon: Bot, path: '/chatbot' },
  { name: 'Chat Content', icon: BookOpen, path: '/chatbot/content' },
  { name: 'Languages', icon: Globe, path: '/languages', adminOnly: true },
  { name: 'Settings', icon: Settings, path: '/settings' }
];

const Sidebar = () => {
  const { logout, isAdmin } = useAuth();

  return (
    <div className="w-[72px] bg-[#0f172a] min-h-screen flex flex-col items-center flex-shrink-0 z-20">
      {/* Logo */}
      <div className="py-5 flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-white/10 ring-1 ring-white/20">
          <img src="/logo.svg" alt="INXT" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-white/10 mb-4" />

      {/* Navigation */}
      <nav className="flex-1 w-full px-2 space-y-1">
        {menuItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <Tooltip
              key={item.name}
              title={item.name}
              placement="right"
              overlayInnerStyle={{
                fontSize: '12px',
                borderRadius: '8px',
                background: '#1e293b',
                padding: '4px 10px',
              }}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30'
                      : 'text-slate-500 hover:bg-white/8 hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : ''}`} strokeWidth={isActive ? 2.2 : 1.8} />
                )}
              </NavLink>
            </Tooltip>
          ))}
      </nav>

      {/* Divider */}
      <div className="w-8 h-px bg-white/10 mt-4 mb-4" />

      {/* Logout */}
      <div className="pb-5">
        <Tooltip
          title="Logout"
          placement="right"
          overlayInnerStyle={{ fontSize: '12px', borderRadius: '8px', background: '#1e293b', padding: '4px 10px' }}
        >
          <button
            onClick={logout}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
