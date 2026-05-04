import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background relative pb-24 md:pb-0 font-body">
      {/* Glassmorphism Sticky Header */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl" role="img" aria-label="dorm">🏫</span>
            <span className="font-display font-extrabold text-xl tracking-tight text-primary">
              Gadorm
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            {/* Desktop Post Button */}
            <Link 
              to="/post" 
              className="hidden md:flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.97] shadow-sm hover:shadow-elevated"
            >
              <Plus size={16} strokeWidth={2.5} />
              {t('header.postItem')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Link 
          to="/post" 
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-8 py-3.5 rounded-2xl font-semibold text-base shadow-elevated active:scale-[0.97] transition-all duration-300"
        >
          <Plus size={20} strokeWidth={2.5} />
          {t('header.postItem')}
        </Link>
      </div>

      {/* Elegant Minimal Footer */}
      <footer className="mt-auto pt-12 pb-8 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-border pt-6">
            <p className="text-xs text-textMuted font-medium tracking-wide uppercase">
              Built by Anar Gadirli
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
