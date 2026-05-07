import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
        className="sticky top-0 z-50 px-4 sm:px-6 pt-3"
      >
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
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-2"
            >
              <span className="text-[22px] leading-none">🏫</span>
              <span className="font-bold text-[17px] tracking-[-0.02em] text-label">
                AktauDorm
              </span>
            </motion.div>
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Desktop CTA — pulsing glow pill button */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
            >
              <Link
                to="/post"
                className="hidden md:flex items-center gap-1.5 bg-blue hover:bg-blueHover text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ease-apple shadow-pill cta-glow"
              >
                <Plus size={15} strokeWidth={2.5} />
                {t('header.postItem')}
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5">
        <Outlet />
      </main>

      {/* ═══════════════════════════════════════════
          MOBILE FAB — Floating, bouncy, magnetic with pulse glow
          ═══════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.5 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            to="/post"
            className="flex items-center gap-2 bg-blue text-white pl-5 pr-6 py-3.5 rounded-full font-semibold text-[15px] shadow-fab transition-all duration-200 ease-apple hover:bg-blueHover cta-glow"
          >
            <Plus size={20} strokeWidth={2.5} />
            {t('header.postItem')}
          </Link>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          FOOTER — Design agency signature
          ═══════════════════════════════════════════ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-auto py-12"
      >
        <p className="text-center text-xl font-bold tracking-wide text-labelTertiary/70">
          Built by{' '}
          <a
            href="https://wa.me/994107171255"
            target="_blank"
            rel="noopener noreferrer"
            className="text-labelSecondary hover:text-blue-600 transition-all duration-300 ease-apple hover:underline underline-offset-4 decoration-blue-600/50 decoration-2 cursor-pointer"
          >
            Anar Gadirli
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
