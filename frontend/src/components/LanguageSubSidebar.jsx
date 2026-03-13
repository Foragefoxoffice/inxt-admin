import { Skeleton, Tag } from 'antd';
import { GlobalOutlined, FolderOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSubSidebar = () => {
  const { languages, activeLanguageId, selectLanguage, loadingLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectLanguage = (lang) => {
    selectLanguage(lang);
    const pathParts = location.pathname.split('/');
    const isFormPage =
      pathParts.includes('create') ||
      pathParts.includes('edit') ||
      /\/[a-f0-9]{24}$/.test(location.pathname);
    if (isFormPage) {
      navigate('/' + pathParts[1]);
    }
  };

  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-60 bg-white border-r border-slate-100 min-h-screen flex flex-col z-10 flex-shrink-0"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Languages</p>
      </div>

      {/* Language List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {loadingLanguages ? (
          <div className="space-y-2 px-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton.Input key={i} active block style={{ height: 40, borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <>
            {/* All Languages */}
            <button
              onClick={() => handleSelectLanguage(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                activeLanguageId === null
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  activeLanguageId === null ? 'bg-sky-100' : 'bg-slate-100'
                }`}
              >
                <GlobalOutlined className={`text-sm ${activeLanguageId === null ? 'text-sky-500' : 'text-slate-400'}`} />
              </div>
              <span className="flex-1 text-sm font-medium text-left">All Languages</span>
              {activeLanguageId === null && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
              )}
            </button>

            {/* Individual Languages */}
            {languages.map((lang) => {
              const isActive = activeLanguageId === lang._id;
              return (
                <button
                  key={lang._id}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive ? 'bg-orange-100' : 'bg-slate-100'
                    }`}
                  >
                    <FolderOutlined className={`text-sm ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-left">{lang.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-5">
        <div className="rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100 p-3.5">
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            Select a language to manage its content
          </p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {languages.slice(0, 3).map((lang) => (
              <Tag key={lang._id} color="blue" className="!text-[10px] !rounded-md !m-0">
                {lang.code?.toUpperCase() || lang.name.slice(0, 2).toUpperCase()}
              </Tag>
            ))}
            {languages.length > 3 && (
              <Tag className="!text-[10px] !rounded-md !m-0">+{languages.length - 3}</Tag>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LanguageSubSidebar;
