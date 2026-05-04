import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Floating header detaches after scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg relative pb-28 md:pb-0 font-sans">
      
      {/* ═══════════════════════════════════════════
          FLOATING PILL HEADER — Apple Dynamic Island vibes
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-3">
        <nav 
          className={`
            glass-nav mx-auto max-w-3xl
            flex items-center justify-between
            px-5 h-14
            rounded-2xl
            transition-all duration-500 ease-apple
            ${scrolled 
              ? 'shadow-float' 
              : 'shadow-none'
            }
          `}
        >
          {/* Logo — minimal, confident */}
          <Link to="/" className="flex items-center gap-2 press">
            <span className="text-[22px] leading-none">🏫</span>
            <span className="font-bold text-[17px] tracking-[-0.02em] text-label">
              Gadorm
            </span>
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Desktop CTA — pill button */}
            <Link
              to="/post"
              className="hidden md:flex items-center gap-1.5 bg-blue hover:bg-blueHover text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ease-apple press shadow-pill"
            >
              <Plus size={15} strokeWidth={2.5} />
              {t('header.postItem')}
            </Link>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5">
        <Outlet />
      </main>

      {/* ═══════════════════════════════════════════
          MOBILE FAB — Floating, bouncy, magnetic
          ═══════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link
          to="/post"
          className="flex items-center gap-2 bg-blue text-white pl-5 pr-6 py-3.5 rounded-full font-semibold text-[15px] shadow-fab press transition-all duration-200 ease-apple hover:bg-blueHover"
        >
          <Plus size={20} strokeWidth={2.5} />
          {t('header.postItem')}
        </Link>
      </div>

      {/* ═══════════════════════════════════════════
          FOOTER — Design agency signature
          ═══════════════════════════════════════════ */}
      <footer className="mt-auto py-10">
        <p className="text-center text-[10px] font-medium tracking-[0.25em] uppercase text-labelTertiary/60 select-none">
          Anar Gadirli
        </p>
      </footer>
    </div>
  );
}
