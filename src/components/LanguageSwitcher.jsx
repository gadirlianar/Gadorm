import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const languages = [
  { code: 'ru', label: '🇷🇺 РУС' },
  { code: 'kk', label: '🇰🇿 ҚАЗ' },
  { code: 'en', label: '🇬🇧 ENG' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-textSecondary hover:text-textMain px-3 py-2 rounded-lg hover:bg-surfaceHover transition-all duration-200"
      >
        <span>{currentLang.label}</span>
        <ChevronDown size={14} className={clsx("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-dropdown overflow-hidden z-50 border border-border/50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={clsx(
                "w-full text-left px-4 py-2.5 text-sm transition-colors duration-150",
                i18n.language === lang.code 
                  ? "text-accent font-semibold bg-accent/5" 
                  : "text-textSecondary hover:bg-surfaceHover hover:text-textMain"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
