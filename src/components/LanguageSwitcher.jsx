import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import clsx from 'clsx';

const languages = [
  { code: 'ru', label: 'РУС', flag: '🇷🇺' },
  { code: 'kk', label: 'ҚАЗ', flag: '🇰🇿' },
  { code: 'en', label: 'ENG', flag: '🇬🇧' }
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
        className="flex items-center gap-1.5 text-[13px] font-medium text-labelTertiary hover:text-label px-2.5 py-1.5 rounded-full hover:bg-pill/50 transition-all duration-200 ease-apple press"
      >
        <Globe size={14} strokeWidth={2} />
        <span>{currentLang.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-card rounded-2xl shadow-dropdownApple overflow-hidden z-50 py-1 animate-slide-up">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={clsx(
                "w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors duration-150 flex items-center gap-2.5",
                i18n.language === lang.code
                  ? "text-blue bg-blue/5"
                  : "text-label hover:bg-bg"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {i18n.language === lang.code && (
                <svg className="w-3.5 h-3.5 ml-auto text-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
