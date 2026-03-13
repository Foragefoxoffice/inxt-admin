import React from 'react';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ selectedLanguage, onSelect, languages }) => {
  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:border-primary-400 cursor-pointer transition-colors">
        <Globe className="w-5 h-5 text-slate-400" />
        <select 
          className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 cursor-pointer"
          value={selectedLanguage}
          onChange={(e) => onSelect(e.target.value)}
        >
          {languages.map(language => (
            <option key={language._id} value={language._id}>
              {language.name} ({language.code})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
