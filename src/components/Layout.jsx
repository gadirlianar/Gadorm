import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background relative pb-20 md:pb-0 font-body">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl drop-shadow-md">🏫</span>
            <span className="font-display font-bold text-2xl tracking-tight text-textMain group-hover:text-primary transition-colors">
              Gadorm
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {/* Desktop Post Button */}
            <Link 
              to="/post" 
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primaryHover hover:to-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-glow hover:shadow-primary/40 active:scale-95 border border-primary/20"
            >
              <Plus size={18} strokeWidth={3} />
              {t('header.postItem')}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[200px] px-4">
        <Link 
          to="/post" 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-glow active:scale-95 transition-transform w-full border border-primary/20"
        >
          <Plus size={24} strokeWidth={3} />
          {t('header.postItem')}
        </Link>
      </div>

      <footer className="mt-auto py-8 text-center text-sm text-textMuted font-medium">
        Anar Gadirli
      </footer>
    </div>
  );
}
