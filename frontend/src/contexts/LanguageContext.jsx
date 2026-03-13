import { createContext, useContext, useState, useEffect } from 'react';
import { languagesAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [activeLanguage, setActiveLanguage] = useState(null); // null = All Languages
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  useEffect(() => {
    // Only fetch if logged in and not on login page
    if (!user || window.location.pathname.includes('/login')) {
      setLoadingLanguages(false);
      return;
    }

    setLoadingLanguages(true);
    languagesAPI.getAll({ isActive: true, limit: 50 })
      .then((res) => {
        setLanguages(res.data.data);
        // Restore last selection
        const saved = localStorage.getItem('cms_language');
        if (saved) {
          const found = res.data.data.find((l) => l._id === saved);
          if (found) {
            setActiveLanguage(found);
            localStorage.setItem('cms_lang_code', found.code.toLowerCase());
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLanguages(false));
  }, [user]);

  const selectLanguage = (language) => {
    setActiveLanguage(language);
    if (language) {
      localStorage.setItem('cms_language', language._id);
      localStorage.setItem('cms_lang_code', language.code.toLowerCase());
    } else {
      localStorage.removeItem('cms_language');
      localStorage.removeItem('cms_lang_code');
    }
  };

  return (
    <LanguageContext.Provider value={{
      languages,
      activeLanguage,
      selectLanguage,
      loadingLanguages,
      activeLanguageId: activeLanguage?._id || null
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
