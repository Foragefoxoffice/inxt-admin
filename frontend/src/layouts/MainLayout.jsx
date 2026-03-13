import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import LanguageSubSidebar from '../components/LanguageSubSidebar';
import ChatWidget from '../components/ChatWidget';

const pageTitles = {
  '/': 'Dashboard',
  '/blogs': 'Blogs',
  '/blogs/new': 'New Blog',
  '/white-papers': 'White Papers',
  '/white-papers/new': 'New White Paper',
  '/webinars': 'Webinars',
  '/webinars/new': 'New Webinar',
  '/news': 'News & Events',
  '/news/new': 'New Event',
  '/careers': 'Careers',
  '/careers/new': 'New Job',
  '/newsletter': 'Newsletter',
  '/languages': 'Languages',
  '/chatbot': 'AI Chatbot',
  '/chatbot/content': 'Chat Content',
  '/chatbot/content/new': 'Add Chat Content',
  '/settings': 'Settings'
};

const MainLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || pageTitles[location.pathname.replace(/\/[^/]+$/, '')] || 'CMS Admin';

  // Determine if we should show the language sub-sidebar
  // Show for all content modules, hide for dashboard and settings
  const showSubSidebar = ['/', '/blogs', '/white-papers', '/webinars', '/news', '/newsletter', '/careers', '/chatbot/content'].some(
    path => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">
      {/* Primary Mini Sidebar */}
      <Sidebar />

      {/* Secondary Language Sidebar */}
      {showSubSidebar && <LanguageSubSidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
